# Kế Hoạch & Kịch Bản Kiểm Thử Chi Tiết (Detailed Test Scenarios)
- **Dự án:** AI Freelance Marketplace
- **Phiên bản:** 1.0.0
- **Tiêu chuẩn:** Áp dụng quy tắc "Test Master" (Happy paths + Edge cases/Error handling, Security, Performance)

---

## 1. Phạm Vi và Phương Pháp Kiểm Thử (Scope & Approach)
- **Unit Test (Backend):** Sử dụng JUnit 5 + Mockito để kiểm tra logic của các Services (vd: AuthService, EscrowService, JobService). Yêu cầu cô lập các external dependencies (Database, AI API, Stripe).
- **Integration Test:** Sử dụng `@DataJpaTest` hoặc `@SpringBootTest` kết hợp Testcontainers để kiểm tra tương tác với Database (MySQL, Redis).
- **E2E Test (Frontend):** Sử dụng Playwright hoặc Cypress để mô phỏng luồng người dùng thực tế (vd: Đăng ký -> Tạo Job -> Gửi Proposal -> Ký Hợp đồng -> Thanh toán).
- **Security & Performance:** Kiểm thử tính toàn vẹn của JWT, Authorization (Role-based), Rate Limiting, và hiệu suất WebSocket Chat.

---

## 2. Kịch Bản Kiểm Thử Chi Tiết (Detailed Test Cases)

> Các kịch bản dưới đây bắt buộc phải kiểm tra cả Happy Path (Luồng chuẩn) và Edge Cases (Trường hợp ngoại lệ/Lỗi).

### SPRINT 1: Xác Thực & Quản Lý Người Dùng (Auth Module)

#### 2.1. API Đăng Ký (Register)
- **[Happy Path] TC-AUTH-01:** Đăng ký thành công với `email` hợp lệ chưa tồn tại, `password` mạnh (>= 8 ký tự, có số, chữ hoa), `role` là CLIENT hoặc EXPERT. Trạng thái người dùng mới được đặt là `PENDING`.
- **[Edge Case] TC-AUTH-02:** Hệ thống trả về lỗi `409 Conflict` (UserAlreadyExistsException) khi đăng ký bằng một `email` đã tồn tại trong cơ sở dữ liệu.
- **[Edge Case] TC-AUTH-03:** Trả về lỗi `400 Bad Request` khi `password` trống, hoặc dưới 8 ký tự, hoặc email sai định dạng (vd: `invalid_email.com`).
- **[Edge Case] TC-AUTH-04:** Missing required fields (vd: thiếu trường `role` hoặc `email`). Hệ thống trả về mã 400 cùng với mảng các thông báo lỗi Validation chi tiết.

#### 2.2. API Đăng Nhập & JWT (Login & Refresh)
- **[Happy Path] TC-AUTH-05:** Đăng nhập thành công với thông tin hợp lệ. Nhận được `accessToken` (chuẩn JWT RS256, hạn 15 phút) và `refreshToken` (Hash được lưu trong DB).
- **[Edge Case] TC-AUTH-06:** Đăng nhập sai mật khẩu hoặc sai email (hoặc email không tồn tại). Hệ thống trả về `401 Unauthorized`.
- **[Security] TC-AUTH-07:** Thử truy cập API yêu cầu quyền xác thực (vd: `GET /api/v1/jobs/my`) với một Access Token đã quá hạn (ExpiredJwtException). Hệ thống trả về mã `401`.
- **[Happy Path] TC-AUTH-08:** Gọi API `/auth/refresh` bằng một `refreshToken` hợp lệ. Nhận được cặp Token mới. Token cũ bị xóa/cập nhật thành trạng thái đã sử dụng (Xoay vòng token/Token Rotation).
- **[Edge Case] TC-AUTH-09:** Gọi API `/auth/refresh` với Refresh Token đã hết hạn hoặc đã bị revoke trước đó. Hệ thống trả về `401`.

#### 2.3. Đăng Xuất (Logout)
- **[Happy Path] TC-AUTH-10:** Gọi API Logout với Authorization header hợp lệ. Refresh Token của phiên đăng nhập đó bị xóa khỏi DB. Đồng thời, Access Token được đẩy vào danh sách Redis Blacklist với TTL bằng thời gian sống còn lại của token.
- **[Security] TC-AUTH-11:** Sau khi đăng xuất thành công, người dùng thử gọi lại bất kỳ API bảo mật nào bằng Access Token vừa dùng. Bị chặn lại bởi JWT Filter do phát hiện token đã nằm trong Blacklist, trả về `401`.

---

### SPRINT 2: Quản Lý Dự Án & Dịch Vụ (Job & Marketplace Module)

#### 2.4. Quản lý Dự án (Job CRUD)
- **[Happy Path] TC-JOB-01:** Tài khoản CLIENT tạo Job mới thành công với đầy đủ `title`, `description`, `budgetMin`, `budgetMax`, `deadline` hợp lệ. Trạng thái mặc định là `DRAFT`.
- **[Edge Case] TC-JOB-02:** Tạo Job thất bại nếu `budgetMax` < `budgetMin` (Kích hoạt Custom validator `@BudgetRange`). Trả về `400`.
- **[Edge Case] TC-JOB-03:** Phân quyền - Cập nhật dự án của người khác. Một CLIENT cố gắng gọi API update Job có `client_id` không khớp với ID của user hiện tại. Trả về lỗi `403 Forbidden`.
- **[Edge Case] TC-JOB-04:** Cố gắng xóa (Delete) một Job đã chuyển sang trạng thái `IN_PROGRESS` (đã có hợp đồng hoạt động). Trả về lỗi kinh doanh `400` hoặc `409` (Thiết kế chỉ cho phép xóa trạng thái DRAFT hoặc OPEN khi chưa có proposal).

#### 2.5. Lọc & Tìm Kiếm Dự Án (Job Search)
- **[Happy Path] TC-JOB-05:** Gọi danh sách dự án với filter `minBudget` và `maxBudget`. Kết quả trả về danh sách phân trang (Pageable) chỉ chứa các dự án có ngân sách nằm trong khoảng này.
- **[Happy Path] TC-JOB-06:** Full-text search dự án theo tham số `keyword` (Match against MySQL Fulltext Search). Hiển thị kết quả khớp tiêu đề hoặc mô tả.
- **[Edge Case] TC-JOB-07:** Thử gửi request phân trang với parameter `page=-1` hoặc `size=1000` (vượt quá giới hạn hiển thị). Hệ thống tự động catch validation giới hạn `size` tối đa (vd: max 50) hoặc trả về lỗi 400.

---

### SPRINT 3: Giao Dịch, Hợp Đồng & Milestone (Contract & Escrow)

#### 2.6. Tạo Hợp Đồng & Khóa Tiền (Escrow Lock)
- **[Happy Path] TC-CON-01:** CLIENT bấm nút "Chấp nhận" một Proposal và cung cấp danh sách Milestone. Hợp đồng được sinh ra với status `ACTIVE`. Status của Job tự động chuyển thành `IN_PROGRESS`.
- **[Security] TC-CON-02:** Kiểm thử @Transactional. Khi tạo hợp đồng, nếu việc cập nhật `locked_amount` trong DB (EscrowService) bị lỗi throw Exception (vd: timeout), thì toàn bộ thông tin Hợp đồng, Job Status và Proposal Status phải tự động bị **Rollback** nguyên vẹn như trước đó.
- **[Edge Case] TC-CON-03:** CLIENT cố chấp nhận Proposal khi số dư trong ví Escrow không đủ (`balance < totalAmount`). Quăng ra lỗi `InsufficientBalanceException`, giao dịch bị chặn và hợp đồng KHÔNG được tạo.

#### 2.7. Bàn Giao Milestone & Giải Ngân
- **[Happy Path] TC-MILE-01:** EXPERT upload `deliverableUrl` cho một Milestone (với status là `PENDING` hoặc `IN_PROGRESS`). Trạng thái Milestone đổi thành `SUBMITTED`.
- **[Happy Path] TC-MILE-02:** CLIENT duyệt (`Approve`) Milestone. Logic xử lý: Tiền trong `locked_amount` của tài khoản Client bị trừ đi tương ứng, hệ thống sinh ra transaction trừ phí nền tảng 10% (Transaction `FEE`), 90% số tiền còn lại được sinh transaction `RELEASE` và cộng vào `balance` khả dụng của EXPERT.
- **[Security] TC-MILE-03 (Race Condition Test):** CLIENT viết script cố tình gọi liên tiếp API `/approve` 5 lần cùng một lúc (Double-spending test) cho cùng 1 Milestone. Cần đảm bảo cơ chế Lock (Pessimistic Locking `SELECT ... FOR UPDATE` trên bảng transactions/escrow) để cam kết tiền chỉ được chuyển đi duy nhất 1 lần và các request sau sẽ nhận thông báo lỗi trạng thái Milestone đã được xử lý.

---

### SPRINT 4: Thanh Toán & Chat Real-Time

#### 2.8. Tích hợp Stripe Webhook (Nạp Tiền)
- **[Happy Path] TC-PAY-01:** Nền tảng nhận được Webhook `checkout.session.completed` hợp lệ từ Stripe với chữ ký `Stripe-Signature` đúng. Tiền được cộng vào bảng Escrow Account của User khớp với reference code.
- **[Security] TC-PAY-02:** Gửi giả mạo Webhook bằng cách gọi API với payload `checkout.session.completed` nhưng KHÔNG có header `Stripe-Signature` hoặc truyền sai Signature. API phải lập tức từ chối với mã lỗi `400` hoặc `401`.

#### 2.9. WebSocket Chat & Thông báo (Notifications)
- **[Happy Path] TC-WS-01:** Web client thực hiện kết nối WebSocket và gửi kèm JWT hợp lệ ở Frame Header (`CONNECT`). Hệ thống xác thực và cho phép Subscribe kênh `/topic/chat/{contractId}`.
- **[Security] TC-WS-02:** Cố gắng kết nối WebSocket không truyền Token hoặc truyền Token đã hết hạn. Server từ chối kết nối ngay lập tức và trả về `MessageDeliveryException`.
- **[Security] TC-WS-03:** Ngăn chặn đọc trộm tin nhắn - Chuyên gia A gửi tin nhắn vào một phòng chat của `contractId` mà Chuyên gia A KHÔNG PHẢI là người thuộc Hợp đồng đó. Hành vi bị chặn lại bởi Business Logic phân quyền trên `ChannelInterceptor` WebSocket.

---

### SPRINT 5: Tích hợp AI (Job Assistant & Recommendations)

#### 2.10. Phân Tích & Sinh Nội Dung Bằng AI
- **[Happy Path] TC-AI-01:** Gọi API `/ai-enhance` truyền vào Draft Job (title ngắn, description sơ sài). Nhận về JSON kết quả đã parse thành DTO, có kèm theo Job Title hay hơn, Mô tả chi tiết và mảng các Kỹ năng còn thiếu.
- **[Edge Case] TC-AI-02:** Thử thách Rate Limiting. User gọi API AI liên tục 15 lần trong vòng vài giây. Hệ thống chặn lại ở lần thứ 11 (do giới hạn max 10 calls/hour ở Bucket4j) và trả về HTTP `429 Too Many Requests`.
- **[Edge Case] TC-AI-03:** Xử lý lỗi API của bên thứ 3. Khi Provider (Anthropic/OpenAI) sập, timeout mạng hoặc quá tải (500). Hệ thống Backend không sập theo, bắt lỗi Timeout và trả về Fallback Response (mảng rỗng hoặc text mặc định) thay vì throw Exception.

#### 2.11. Thuật Toán Gợi Ý (Cosine Similarity)
- **[Happy Path] TC-AI-04:** Chạy function thuật toán `cosineSimilarity()`. Input 2 Vector giống hệt nhau (vd: `[1.0, 0.5, 0.2]`) thì kết quả trả về bằng (hoặc rất xấp xỉ) `1.0`. Vector hoàn toàn trái ngược trả về kết quả gần `0`.
- **[Edge Case] TC-AI-05:** Truyền List rỗng hoặc List có chiều dài số chiều (Dimensions) khác nhau (vd: Vector A dài 1536, Vector B dài 1530). Phương thức quăng ra lỗi hợp lệ `IllegalArgumentException` để tránh chạy sai lệch AI model.

---

## 3. Tiêu Chí Nghiệm Thu & Đảm Bảo Chất Lượng (Quality Gates)
1. **Code Coverage:** Yêu cầu mức độ bao phủ mã tự động hóa tối thiểu đạt **80%** (cho các layer Service và Util). Quá trình CI/CD sẽ quét qua JaCoCo và SonarQube, báo đỏ nếu dưới mức này.
2. **Loại Bỏ Test Flaky:** Bất kỳ Unit test hoặc Integration test nào bị Flaky (Lúc thì passed, lúc chạy lại thì failed mà không đổi code) phải được đưa vào danh sách đen `@Disabled` và tìm lỗi tận gốc. Thường là do phụ thuộc múi giờ, async timing hoặc thứ tự chạy.
3. **Môi Trường Test Độc Lập:** Đối với Integration Test tương tác Database, dữ liệu phải được dọn dẹp sạch sẽ sau mỗi Test Case (Dùng `@Sql(scripts = "clean.sql")` hoặc tự động Rollback cơ sở dữ liệu ảo của Testcontainers).
4. **Không Có Lời Gọi API Bên Ngoài Trong Unit Test:** Tất cả các hành vi gọi ra Internet (Stripe Gateway, Anthropic/OpenAI, AWS S3) trong phạm vi Unit Test bắt buộc phải dùng Mock object (VD: `Mockito.when(...)`).

---

## 4. Báo Cáo Fix & Khuyến Nghị (Actionable Fix Recommendations)
- **Vấn đề Đồng Thời (Concurrency) ở Nút Duyệt Milestone:** Rất dễ bị Double Spending.
  - *Recommendation:* Việc chuyển tiền (RELEASE) từ Escrow bắt buộc phải bọc trong `@Transactional(isolation = Isolation.REPEATABLE_READ)` hoặc sử dụng khóa bi quan (Pessimistic Locking / `SELECT ... FOR UPDATE`) trên bảng `escrow_accounts` để khóa dòng dữ liệu của User này lại cho đến khi giao dịch trừ tiền kết thúc.
- **Rủi ro XSS khi Lưu Trữ JWT:** Tài liệu thiết kế đang đề cập đến việc lưu `tokens` vào `localStorage`.
  - *Recommendation:* Nếu tiếp tục lưu ở `localStorage`, toàn bộ text render ra frontend bắt buộc phải được mã hóa/escape (Mặc định React đã làm, nhưng cẩn thận `dangerouslySetInnerHTML`). Cách phòng vệ sâu cấp 2 là đổi sang lưu `refreshToken` vào `HttpOnly Cookie`.
- **Vét Cạn Database (Pagination Validation):**
  - *Recommendation:* Khi làm API phân trang (đặc biệt là public endpoint như Marketplace), cần cấu hình Spring `spring.data.web.pageable.max-page-size=100` để phòng ngừa Hacker request `size=10000` làm Out of Memory (OOM) Server hiện tại (vốn chỉ có 1GB RAM EC2).
