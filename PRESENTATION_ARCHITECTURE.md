# 🎤 KỊCH BẢN THUYẾT TRÌNH — KIẾN TRÚC HỆ THỐNG AIMARKET

> **Dành cho:** Thuyết trình SWP392 — phần System Architecture
> **Thời gian gợi ý:** 5–7 phút
> **Người nói:** Thành viên phụ trách Backend / Architecture

---

## 📌 SLIDE MỞ ĐẦU — Giới thiệu kiến trúc tổng quan

**[Chuyển sang slide System Architecture]**

> *"Tiếp theo, em xin trình bày về kiến trúc hệ thống của AIMarket."*

Hệ thống AIMarket được xây dựng theo mô hình **3-Layer Architecture phía Backend** kết hợp với **Separated SPA phía Frontend** — hai phần hoàn toàn độc lập nhau, giao tiếp qua **REST API** và **WebSocket**.

Trên màn hình các thầy cô thấy toàn bộ hệ thống chia làm 4 tầng chính từ trên xuống:

- **Tầng 1 — Client (Browser):** Nơi người dùng tương tác qua giao diện React
- **Tầng 2 — Nginx Reverse Proxy:** Đóng vai bộ định tuyến, phân luồng request đúng chỗ
- **Tầng 3 — Backend (Spring Boot):** Trái tim xử lý toàn bộ nghiệp vụ
- **Tầng 4 — Data & External APIs:** MySQL và các dịch vụ bên ngoài như Stripe, Gemini AI

---

## 📌 PHẦN 1 — Backend: 3-Layer Architecture

**[Trỏ vào phần Backend trên diagram]**

> *"Em sẽ đi vào chi tiết phần Backend trước, vì đây là nơi chứa toàn bộ logic nghiệp vụ của hệ thống."*

Backend của AIMarket tuân thủ chặt chẽ mô hình **3 tầng**. Nguyên tắc quan trọng nhất là: **mỗi tầng chỉ được gọi tầng ngay bên dưới** — Controller không bao giờ gọi thẳng Repository.

### Tầng 1 — Controller (Presentation Layer)

> *"Khi một request từ browser gửi lên, ví dụ `POST /api/v1/jobs` để Client tạo một Job mới — nó sẽ đến Controller đầu tiên."*

Controller chỉ làm 3 việc:
- **Nhận** HTTP request và parse dữ liệu JSON
- **Kiểm tra quyền** thông qua annotation `@PreAuthorize` — ví dụ chỉ CLIENT mới được tạo Job, chỉ ADMIN mới được duyệt tranh chấp
- **Gọi Service** rồi bọc kết quả vào ResponseEntity trả về JSON

*Lưu ý quan trọng:* Controller không chứa bất kỳ logic nghiệp vụ nào. Nếu viết logic trong Controller là sai mô hình.

### Tầng 2 — Service (Business Logic Layer)

> *"Toàn bộ logic nghiệp vụ thực sự nằm ở tầng Service."*

Dự án có **16 service** chia làm 2 nhóm:

**Nhóm Core Services** gồm AuthService, JobService, ContractService... — xử lý các luồng nghiệp vụ chính.

**Nhóm AI Services** gồm 3 service đặc biệt:
- `AIJobAssistantService` — khi Client nhấn nút "AI Enhance", service này gọi Gemini API để làm phong phú mô tả Job
- `AIServiceGeneratorService` — Expert nhấn "AI Generator" khi tạo Gig, AI tự viết title và description hấp dẫn
- `AIRecommendationService` — sau khi Client đăng Job, hệ thống tự động tính toán vector embedding và dùng Cosine Similarity để gợi ý top 5 Expert phù hợp nhất

Service tầng này cũng sử dụng 3 tính năng kỹ thuật quan trọng:
- `@Transactional` — đảm bảo khi một nghiệp vụ cần nhiều bước ghi DB, tất cả thành công hoặc tất cả rollback
- `@Async` — ví dụ khi gửi notification, hệ thống không block request chờ — đẩy sang thread riêng
- `@Scheduled` — EscrowService có 2 cron job chạy mỗi giờ tự động dọn dẹp dữ liệu hết hạn

### Tầng 3 — Repository (Data Access Layer)

> *"Tầng cuối cùng là Repository — chỉ chịu trách nhiệm duy nhất: nói chuyện với MySQL."*

Dự án dùng **Spring Data JPA** — chỉ cần khai báo interface, framework tự generate câu SQL. Kết hợp với **Flyway Migration** để quản lý schema — hiện có 8 version từ V1 tạo 22 bảng đến V8 bổ sung tính năng mới nhất. Cách này đảm bảo team dev không bị conflict khi cùng thay đổi database.

---

## 📌 PHẦN 2 — EscrowService: Điểm nổi bật kỹ thuật

**[Trỏ vào phần Escrow Flow]**

> *"Trong các service, em muốn nhấn mạnh EscrowService vì đây là core business quan trọng nhất và phức tạp nhất của hệ thống."*

EscrowService thực hiện **State Machine** quản lý tiền của hợp đồng qua 4 trạng thái:

1. **DEPOSIT** — Client nạp tiền qua Stripe, số dư vào ví
2. **ESCROW_LOCK** — Khi Client chấp nhận Proposal, tiền bị khóa vào Escrow — Expert chưa nhận được
3. **RELEASE** — Khi Client Approve từng Milestone, hệ thống mới giải phóng tiền cho Expert (sau khi trừ 10% phí platform)
4. **REFUND** — Nếu xảy ra tranh chấp và Admin phán quyết Expert sai, tiền hoàn về Client

> *"Thiết kế này đảm bảo an toàn cho cả 2 phía: Client không mất tiền khi Expert không giao hàng, Expert được trả ngay khi được duyệt."*

---

## 📌 PHẦN 3 — Frontend: Separated SPA

**[Trỏ vào phần Frontend]**

> *"Về phía Frontend, team chọn mô hình SPA — Single Page Application — bằng React 18."*

**SPA nghĩa là gì?** Browser chỉ tải app một lần duy nhất. Sau đó mọi điều hướng giữa các trang do JavaScript xử lý — không có reload trang.

Frontend được tổ chức thành 4 tầng:

- **pages/** — Màn hình UI, mỗi page là một route của React Router
- **hooks/** — Logic xử lý: `useWebSocket` kết nối STOMP, `useChat` subscribe kênh chat, `useNotifications` nhận thông báo realtime
- **api/** — Layer gọi HTTP: axios với interceptor tự động gắn JWT và tự refresh token khi hết hạn
- **store/** — Zustand lưu global state: thông tin user, accessToken, role sau khi login

**Tại sao không dùng MVC truyền thống?**
Backend chỉ trả JSON — không render HTML. Frontend deploy thành container riêng. Lợi ích rõ ràng: team FE và BE làm song song không đụng code nhau, và nếu sau này làm app mobile, dùng ngay API Spring Boot mà không phải viết lại.

---

## 📌 PHẦN 4 — Realtime: WebSocket STOMP

**[Trỏ vào phần WebSocket]**

> *"Một điểm kỹ thuật đáng chú ý là tính năng Realtime của hệ thống."*

Hệ thống dùng **WebSocket với giao thức STOMP** — thay vì client phải liên tục hỏi server "có tin nhắn mới không?", server sẽ chủ động đẩy dữ liệu xuống ngay khi có sự kiện.

Có 2 loại channel:
- `/topic/contract/{id}` — kênh chat của từng hợp đồng, Client và Expert cùng subscribe
- `/user/{id}/queue/notifications` — kênh riêng tư cho từng user nhận thông báo

Khi Expert gửi tin nhắn, tin được lưu vào MySQL rồi broadcast ngay đến tất cả người đang xem hợp đồng đó — không cần F5.

---

## 📌 PHẦN 5 — Security & Cross-cutting Concerns

**[Trỏ vào phần Security]**

> *"Về bảo mật, hệ thống có nhiều lớp bảo vệ chạy song song."*

- **JWT Authentication:** Mỗi request phải mang Access Token (15 phút). Hết hạn thì axios tự gọi refresh — người dùng không cần login lại
- **Rate Limiting (Bucket4j):** AI endpoints bị giới hạn **10 lần/giờ/user** để kiểm soát chi phí API. Người dùng thường bị giới hạn 1000 lần/phút. Anonymous chỉ 100 lần/phút
- **Security Headers:** Mọi response tự động gắn `X-Frame-Options`, `Content-Security-Policy`, `HSTS`... ngăn XSS và clickjacking
- **Role-based Authorization:** `@PreAuthorize` gắn trực tiếp trên method — CLIENT, EXPERT, ADMIN có quyền khác nhau với từng endpoint

---

## 📌 PHẦN 6 — Deployment

**[Trỏ vào phần Deployment]**

> *"Cuối cùng về deployment — hệ thống đang chạy live trên VPS."*

Toàn bộ hệ thống được containerize bằng **Docker Compose** với 4 container:

- **Nginx** trên host: làm reverse proxy, phân luồng `/api/*`, `/ws/*` vào Backend, còn lại vào Frontend
- **Frontend container:** Nginx bên trong phục vụ file React tĩnh
- **Backend container:** Spring Boot Java 21
- **MySQL container:** Database chính, init tự động từ file SQL khi khởi động lần đầu

Tất cả container nằm trong một Docker network nội bộ — MySQL và Redis không expose ra Internet.

---

## 📌 KẾT — Tóm tắt

> *"Tóm lại, kiến trúc AIMarket có thể được tóm gọn bằng 5 điểm:"*

| # | Điểm nhấn |
|---|---|
| 1 | **3-Layer rõ ràng** — dễ maintain, dễ test từng phần độc lập |
| 2 | **AI tích hợp tự nhiên** — 3 service AI, có thể switch provider qua config |
| 3 | **Escrow bảo vệ 2 phía** — tiền an toàn, minh bạch từng bước |
| 4 | **Realtime không polling** — WebSocket STOMP cho chat + notification |
| 5 | **Security đa tầng** — JWT + Rate limit + Headers + Role-based |

> *"Em xin hết phần kiến trúc hệ thống. Thầy cô có câu hỏi gì về thiết kế không ạ?"*

---

## 💡 GỢI Ý CÂU HỎI THƯỜNG GẶP & CÂU TRẢ LỜI

**Q: Tại sao không dùng Redis Cache mà dùng JVM in-memory Cache?**
> *"Dự án hiện scale đơn giản với 1 instance backend. JVM Cache đủ dùng và không cần infrastructure thêm. Khi scale ra nhiều instance mới cần Redis để share cache giữa các node."*

**Q: WebSocket có scale được không nếu có nhiều user?**
> *"Broker hiện là in-memory — phù hợp với quy mô của dự án. Khi cần scale horizontally thì nâng lên RabbitMQ hoặc Redis Pub/Sub là bước tự nhiên tiếp theo."*

**Q: Logout thì token cũ còn dùng được không?**
> *"Access token vẫn hợp lệ đến khi hết hạn 15 phút. Refresh token thì bị revoke ngay trong MySQL. Đây là trade-off của stateless JWT — chấp nhận được vì window rủi ro ngắn."*

**Q: AI provider nào đang dùng thực tế?**
> *"Default là Google Gemini Flash vì free tier 1500 request/ngày, không cần credit card. Có thể switch sang OpenAI GPT-4o-mini hoặc Anthropic Claude 3 Haiku bằng một dòng config."*

**Q: Tại sao có Redis container nhưng không dùng?**
> *"Container Redis được chuẩn bị sẵn cho scaling sau. Hiện tại chưa cần vì traffic còn nhỏ. Khi cần: thêm spring-data-redis vào pom.xml và đổi CacheManager là xong."*
