# AIMarket (AITasker) — Chi tiết Chức năng Hệ thống (System Features)

Đây là danh sách tài liệu tổng hợp **tất cả** các chức năng từ lớn đến nhỏ của nền tảng AIMarket (AITasker), được trích xuất trực tiếp từ mã nguồn thực tế (Backend Controllers & Frontend Pages).

---

## 0. Kiến trúc & Mô hình Hoạt động (Architecture & Business Models)

- **Kiến trúc mở rộng (Scalable Architecture):** Hệ thống được thiết kế theo kiến trúc cloud-based, sẵn sàng triển khai và mở rộng trên các nền tảng đám mây (AWS/GCP).
- **Mô hình thuê linh hoạt (Hiring Models):** Hỗ trợ đồng thời 2 mô hình:
  - *Project-based (Theo dự án):* Client đăng việc (Job) → Expert nộp báo giá (Proposal) → Client duyệt → sinh Contract.
  - *Service-based (Theo dịch vụ/Gig):* Expert đóng gói dịch vụ sẵn → Client vào Marketplace mua ngay → sinh Contract trực tiếp.
- **Quản lý vòng đời dự án (End-to-end lifecycle management):** Tích hợp toàn bộ quy trình từ lúc tìm chuyên gia, thỏa thuận, thực hiện cột mốc, thanh toán và xử lý tranh chấp trong một luồng thống nhất.

---

## 1. Xác thực & Phân quyền (Authentication & Authorization)

- **Đăng ký tài khoản (Register):** Hỗ trợ tạo tài khoản mới với 2 vai trò: `CLIENT` (Người thuê) và `EXPERT` (Chuyên gia AI).
- **Đăng nhập (Login):** Xác thực bằng email và mật khẩu, trả về JWT Access Token + Refresh Token.
- **Điều hướng thông minh:** Tự động điều hướng người dùng sau khi đăng nhập về đúng dashboard riêng (`/dashboard/client`, `/dashboard/expert`, hoặc `/admin/dashboard`).
- **Middleware bảo mật:** Chặn người dùng chưa đăng nhập, tự động gia hạn token (Refresh Token rotation) hoặc đẩy ra màn hình Login nếu token hết hạn. Kiểm tra chặt chẽ vai trò (Role-based Access Control - `@PreAuthorize`) ở mọi endpoint API.
- **Quên & Đặt lại mật khẩu (Forgot / Reset Password):** Gửi link reset qua email, token lưu tạm trong Redis với TTL 15 phút.
- **Đăng xuất (Logout):** Blacklist Access Token trong Redis + revoke Refresh Token.

---

## 2. Quản lý Hồ sơ Người dùng (User Profile)

- **Xem thông tin (View Profile & Portfolio):** Hiển thị thông tin cá nhân, danh mục hồ sơ năng lực (Portfolio) để chuyên gia trình bày các dự án AI đã thực hiện. Mỗi mục Portfolio bao gồm: tiêu đề dự án, mô tả ngắn, link demo/GitHub, ảnh hoặc video minh chứng, và công nghệ/kỹ năng đã sử dụng.
- **Quản lý Portfolio (Portfolio Management):** Expert có thể thêm, sửa, xóa từng mục trong Portfolio; sắp xếp thứ tự hiển thị để làm nổi bật các dự án tiêu biểu nhất.
- **Cập nhật thông tin (Update Profile):** Cập nhật Tên đầy đủ, Giới thiệu bản thân (bio), Múi giờ (timezone) và Mức lương theo giờ (hourly rate — dành riêng cho Expert).
- **Quản lý Kỹ năng (Skills Management):** Cho phép Expert thêm, sửa, xóa danh sách các kỹ năng AI thế mạnh (ví dụ: Prompt Engineering, NLP, Computer Vision).

---

## 3. Trợ lý Trí tuệ Nhân tạo (AI Modules Integration)

Được tích hợp trực tiếp với OpenAI (GPT-4o-mini) và Anthropic (Claude-3-Haiku).

- **AI Enhance Job Posting (Client):** Tự động phân tích tiêu đề và vài dòng mô tả ngắn của Client để viết lại thành một bản JD (Job Description) chi tiết, chuyên nghiệp. Ngoài ra, AI còn trả về:
  - *Gợi ý ngân sách (Suggested Budget):* Ước tính mức giá thị trường phù hợp dựa trên độ phức tạp và phạm vi công việc.
  - *Gợi ý kỹ năng (Suggested Skills):* Danh sách các tag kỹ năng AI liên quan (ví dụ: NLP, Computer Vision, RAG, Fine-tuning) để Client gắn vào Job, giúp hệ thống Recommendation khớp chính xác hơn.
- **AI Service Generator (Expert):** Expert chỉ cần nhập từ khóa, AI sẽ tự động sinh ra tiêu đề hấp dẫn, gói dịch vụ, và mô tả bán hàng thu hút khách.
- **AI Expert Recommendation:** Hệ thống tự động phân tích yêu cầu của dự án (Job) và thuật toán AI sẽ quét qua toàn bộ cơ sở dữ liệu để đề xuất danh sách các Chuyên gia (Experts) phù hợp nhất.

---

## 4. Quản lý Dự án / Công việc (Jobs Management — Client Side)

- **Đăng dự án (Post Job):** Client tạo dự án mới với tiêu đề, mô tả, ngân sách (min–max), thời hạn thực hiện (start date, deadline, expected duration), và kỹ năng yêu cầu.
- **Quản lý dự án cá nhân (My Jobs):** Danh sách các dự án đã đăng.
- **Cập nhật & Xóa dự án (Update/Delete):** Áp dụng cho các dự án ở trạng thái DRAFT hoặc OPEN chưa có hợp đồng.
- **Xuất bản dự án (Publish):** Đẩy dự án từ bản nháp (DRAFT) lên Marketplace công khai (OPEN).
- **Duyệt dự án (Browse Jobs):** Màn hình dành cho Expert để tìm kiếm, lọc theo keyword/skills/budget, và phân trang các dự án đang tuyển.

---

## 5. Quản lý Dịch vụ (Services / Gigs — Expert Side)

- **Tạo dịch vụ (Create Service):** Expert tạo các gói dịch vụ AI định sẵn (tên, mô tả, giá tiền, thời gian giao hàng).
- **Quản lý dịch vụ cá nhân (My Services):** Xem danh sách các dịch vụ mình đang cung cấp.
- **Cập nhật & Xóa dịch vụ (Update/Delete Service).**
- **Kích hoạt / Tạm ngưng (Activate/Deactivate):** Ẩn hoặc hiện dịch vụ khỏi Marketplace.
- **Marketplace Khám phá Dịch vụ:** Hiển thị danh sách toàn bộ dịch vụ đang hoạt động trên sàn, hỗ trợ lọc và tìm kiếm.

---

## 6. Quản lý Báo giá (Proposals — Expert ↔ Client)

- **Nộp báo giá (Submit Proposal):** Expert gửi đề xuất cho một Job, bao gồm giá đề nghị, thời gian dự kiến, và thư giới thiệu (cover letter).
- **Xem danh sách báo giá (List Proposals):** Client xem tất cả các báo giá nhận được cho từng Job.
- **Chấp nhận / Từ chối (Accept / Reject):** Client duyệt hoặc từ chối báo giá.
- *(Logic ngầm: Khi Client bấm Accept, hệ thống tự động sinh ra một bản Hợp Đồng — Contract.)*

---

## 7. Quản lý Hợp đồng & Cột mốc (Contracts & Milestones)

- **Quan hệ Project → Contract:** Khi Client chấp nhận một Proposal, hệ thống tạo ra một `Contract` liên kết trực tiếp với Job, Expert được chọn, tổng giá trị thỏa thuận và danh sách Milestone.
- **Xem chi tiết hợp đồng:** Hiển thị thông tin dự án, hai bên tham gia, giá trị tổng, số tiền đang giữ trong Escrow, và trạng thái.
- **Cột mốc thanh toán (Milestones):** Hợp đồng được chia thành nhiều giai đoạn, mỗi Milestone có: tên, mô tả deliverable, giá trị tiền, và deadline riêng.
- **Nộp sản phẩm (Submit Work):** Expert tải lên kết quả công việc (link báo cáo / URL deliverable) để hoàn thành Milestone.
- **Duyệt sản phẩm (Approve Milestone):** Client nghiệm thu. Hệ thống tự động chuyển tiền từ Escrow sang ví Expert.
- **Từ chối (Reject Milestone):** Client yêu cầu Expert làm lại nếu sản phẩm chưa đạt.

### Luồng Escrow chi tiết (Escrow Flow)

| Bước | Trạng thái | Mô tả |
|------|-----------|-------|
| 1 | `FUNDED` | Client nạp tiền vào ví và xác nhận bắt đầu Contract. Số tiền tương ứng với từng Milestone bị lock trong Escrow. |
| 2 | `LOCKED` | Tiền bị giữ trong Escrow suốt quá trình Expert thực hiện Milestone. Cả hai bên không thể rút khoản này. |
| 3 | `RELEASED` | Client bấm Approve Milestone → hệ thống tự động chuyển tiền từ Escrow sang ví Expert ngay lập tức. |
| 4 | `REFUNDED` | Admin giải quyết Dispute nghiêng về phía Client, hoặc Contract bị hủy trước khi bắt đầu → tiền hoàn về ví Client. |

---

## 8. Ví điện tử & Thanh toán (Wallet & Payments)

- **Xem số dư ví (Balance)** và **Lịch sử giao dịch (Transactions):** Cả Client lẫn Expert đều có ví cá nhân với lịch sử giao dịch đầy đủ (nạp, rút, escrow lock, release, refund, phí).
- **Nạp tiền (Deposit):** Tích hợp cổng thanh toán **Stripe** (kèm Webhook tự động gọi về backend để cộng tiền khi user quẹt thẻ thành công). Có API Mock-deposit dùng riêng cho môi trường Dev.
- **Rút tiền (Withdraw):** Expert tạo lệnh rút tiền từ số dư trong ví về tài khoản thực.
- **Phê duyệt rút tiền (Admin):** Admin xét duyệt **Approve** (cho phép rút) hoặc **Reject** (hủy lệnh rút) đối với các yêu cầu rút tiền.

---

## 9. Hệ thống Khiếu nại (Disputes)

- **Mở khiếu nại (Open Dispute):** Bất kỳ bên nào (Client/Expert) cũng có thể mở khiếu nại lên Admin nếu có mâu thuẫn trong quá trình thực hiện Hợp đồng.
- **Quản lý khiếu nại (Admin):** Xem danh sách tất cả các đơn khiếu nại trên toàn hệ thống.
- **Giải quyết khiếu nại (Resolve Dispute):** Admin đưa ra phán quyết cuối cùng, hệ thống tự động hoàn tiền (Refund cho Client) hoặc thanh toán (Payout cho Expert) dựa trên phân định.

---

## 10. Trò chuyện (Chat System)

- **Nhắn tin theo hợp đồng:** Mỗi Contract có kênh chat riêng giữa Client và Expert, hỗ trợ nhắn tin theo thời gian thực (WebSocket / STOMP protocol).
- **Xem lịch sử chat:** Phân trang lịch sử tin nhắn cho từng hợp đồng.
- **Đếm tin chưa đọc (Unread Count):** Hiển thị số tin nhắn chưa đọc per contract.

---

## 11. Đánh giá & Nhận xét (Reviews & Ratings)

- **Viết đánh giá (Post Review):** Sau khi hợp đồng kết thúc, Client có thể viết nhận xét và chấm điểm (1–5 sao) cho Expert.
- **Xem đánh giá:** Hiển thị danh sách các review công khai kèm theo điểm đánh giá trung bình trên trang hồ sơ của Expert.

---

## 12. Thông báo (Notifications)

- **Nhận thông báo tự động** cho các sự kiện quan trọng:
  - Dự án có người ứng tuyển (Proposal mới).
  - Hợp đồng mới được tạo.
  - Đối tác vừa gửi báo cáo / nghiệm thu / từ chối Milestone.
  - Giao dịch nạp / rút tiền thành công.
- **Đếm số lượng chưa đọc (Unread count):** Hiển thị badge số đỏ ở icon chuông trên thanh điều hướng.
- **Đánh dấu đã đọc:** Click vào từng thông báo (Mark as read) hoặc bấm nút Đánh dấu tất cả đã đọc (Mark all as read).

---

## 13. Quản trị Hệ thống (Admin Dashboard)

Bên cạnh việc duyệt Rút tiền (Mục 8) và giải quyết Khiếu nại (Mục 9), tài khoản Admin còn có các chức năng vận hành tổng thể:

- **Quản lý Người dùng (Manage Users):** Xem danh sách toàn bộ Client/Expert, khóa (ban) hoặc kích hoạt lại tài khoản có hành vi vi phạm.
- **Quản lý Dự án & Dịch vụ (Manage Jobs & Services):** Giám sát toàn bộ tin tuyển dụng và gói dịch vụ trên sàn, có quyền gỡ bỏ các tin vi phạm tiêu chuẩn cộng đồng.
- **Giám sát giao dịch & Phân tích (Monitor Transactions & Analytics):** Xem thống kê luồng tiền (nạp, rút, giữ hộ qua Escrow), phân tích tỷ lệ chuyển đổi và tỷ lệ thành công của các dự án.

---

## 14. Mô hình Dữ liệu Cốt lõi (Core Data Entities)

Danh sách các thực thể chính trong hệ thống:

| Entity | Vai trò | Quan hệ chính |
|--------|---------|---------------|
| `User` | Người dùng hệ thống (CLIENT / EXPERT / ADMIN) | 1 User có nhiều JobPost, Service, Proposal |
| `JobPost` | Dự án Client đăng tuyển | Thuộc 1 Client; có nhiều Proposal, 1 Contract |
| `Proposal` | Báo giá của Expert cho một Job | Thuộc 1 Expert + 1 JobPost; khi Accept → sinh Contract |
| `Service` | Gói dịch vụ Expert bán sẵn trên Marketplace | Thuộc 1 Expert; Client mua → sinh Contract trực tiếp |
| `Contract` | Hợp đồng ràng buộc giữa Client và Expert | Liên kết JobPost/Service + Expert; chứa nhiều Milestone |
| `Milestone` | Cột mốc giao hàng và thanh toán từng phần | Thuộc 1 Contract; có trạng thái Escrow riêng |
| `EscrowAccount` | Ví & quỹ tạm giữ của mỗi User | Balance, lockedAmount, totalDeposited, totalReleased |
| `Transaction` | Giao dịch tài chính (DEPOSIT, ESCROW_LOCK, RELEASE, REFUND, FEE, WITHDRAW) | Liên kết User + Milestone |
| `Review` | Đánh giá sau khi hoàn thành Contract | Client viết cho Expert; gắn với Contract đã hoàn thành |
| `Message` | Tin nhắn trong kênh chat per Contract | Thuộc 1 Contract, giữa Client và Expert |
| `Notification` | Thông báo hệ thống cho User | Liên kết User; có trạng thái read/unread |
| `Dispute` | Đơn khiếu nại liên quan đến Contract | Liên kết Contract; Admin resolve |