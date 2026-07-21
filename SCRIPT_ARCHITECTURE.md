# 🎤 KỊCH BẢN THUYẾT TRÌNH – TỔNG QUAN KIẾN TRÚC AIMARKET

> **Thời lượng:** ~4–5 phút
> **Ghi chú:** Dùng tay hoặc bút laser chỉ vào đúng khối đang nói. Bám theo luồng mắt: **Trái → Giữa → Phải → Trên cùng**

---

## 🟢 PHẦN MỞ ĐẦU — Chỉ bao quát toàn bộ sơ đồ

> *"Dạ, thưa thầy cô, em xin phép trình bày về **Kiến trúc Hệ thống** của dự án AIMarket.*
>
> *Nhìn vào sơ đồ, toàn bộ hệ thống được đóng gói bằng **Docker Compose** và đang chạy thực tế trên một **VPS** với tên miền công khai là `aimarketswp.duckdns.org` — viền ngoài cùng đứt nét này chính là ranh giới của hạ tầng đó.*
>
> *Kiến trúc được thiết kế theo mô hình **phân tầng rõ ràng**, gồm 3 tầng chính: Client, Hệ thống lõi triển khai trên VPS, và các Dịch vụ bên thứ 3 — để đảm bảo tính bảo mật, hiệu năng và khả năng mở rộng."*

---

## 🔵 BƯỚC 1 — Khối Client: Web Browser (Trái)

> *"Luồng bắt đầu từ phía người dùng — **Web Browser**.*
>
> *Giao diện của AIMarket được xây dựng bằng **React 18 kết hợp TypeScript và Vite**. Đây là công nghệ frontend hiện đại nhất hiện tại — TypeScript giúp code chặt chẽ, ít lỗi hơn; còn Vite mang lại tốc độ build và hot-reload cực nhanh, giúp tụi em phát triển hiệu quả hơn rất nhiều so với các công cụ cũ."*

---

## 🔵 BƯỚC 2 — Nginx: Reverse Proxy (Giữa trái)

> *"Mọi request từ Browser không đi thẳng vào hệ thống mà phải qua **Nginx** trước — đóng vai trò **Reverse Proxy** tại Port 80.*
>
> *Nginx làm nhiệm vụ phân luồng thông minh:*
> - *Nếu request bắt đầu bằng `/api/` — đây là gọi dữ liệu — Nginx đẩy ngay vào **Backend Spring Boot**.*
> - *Nếu bắt đầu bằng `/ws/` — đây là WebSocket — cũng vào Backend để duy trì kết nối realtime.*
> - *Còn lại, tất cả request giao diện sẽ được điều hướng xuống **Frontend Container** bên dưới.*
>
> *Thiết kế này giúp Backend không bao giờ lộ ra ngoài internet trực tiếp — bảo mật được đảm bảo từ điểm đầu tiên."*

---

## 🔵 BƯỚC 3 — React 18 SPA: Frontend Container (Giữa dưới)

> *"Nhìn xuống phía dưới, đây là **React 18 SPA** — Single Page Application — chạy trong container Docker riêng.*
>
> *Sau khi build bằng Vite, mã frontend trở thành các file tĩnh HTML, CSS, JS. Lần đầu người dùng truy cập, Nginx trả về file đó một lần duy nhất. Từ đó trở đi, **toàn bộ điều hướng trang diễn ra trên trình duyệt** — không cần tải lại, trải nghiệm mượt mà như app native."*

---

## 🔴 BƯỚC 4 — Spring Boot 3.3: Trái tim của hệ thống (Trung tâm)

> *"Và đây là **trái tim** của toàn bộ hệ thống — **Spring Boot 3.3** chạy trên **Java 21**.*
>
> *Backend được tổ chức thành 4 tầng chức năng rõ ràng:*
>
> *Thứ nhất: **16 REST Controllers** — tiếp nhận request từ Nginx, trả về dữ liệu chuẩn JSON cho Frontend.*
>
> *Thứ hai: **16 Services với @Async và @Scheduled** — đây là nơi chứa toàn bộ logic nghiệp vụ. Annotation `@Async` cho phép xử lý bất đồng bộ — ví dụ gửi email thông báo mà không làm chậm response. `@Scheduled` tự động chạy các tác vụ định kỳ như đồng bộ dữ liệu.*
>
> *Thứ ba: **WebSocket STOMP** — duy trì kết nối hai chiều realtime để người dùng nhận thông báo và chat ngay lập tức mà không cần F5.*
>
> *Thứ tư và quan trọng nhất là lớp bảo mật: **JWT** để xác thực danh tính, **Bucket4j** để Rate Limiting — chống tấn công brute-force và spam API, cùng các Security Headers theo chuẩn OWASP."*

---

## 🟡 BƯỚC 5 — MySQL & JVM Cache: Lưu trữ dữ liệu (Phải)

> *"Nhìn sang bên phải, Backend giao tiếp với 2 thành phần lưu trữ.*
>
> *Phía trên là **MySQL 8.0** — cơ sở dữ liệu quan hệ chứa **22 bảng** cốt lõi. Điểm đáng chú ý là tụi em dùng **Flyway** để quản lý version schema từ V1 đến V8 — mỗi thay đổi cấu trúc database đều được track và rollback được, rất quan trọng khi làm nhóm.*
>
> *Phía dưới là **JVM Cache** — sử dụng `ConcurrentMapCacheManager` lưu trực tiếp trên RAM của JVM. Tụi em cache 2 loại dữ liệu nặng nhất: **gợi ý chuyên gia** (`expert-recommendations`) và **AI enhance job** (`ai-job-enhance`). Nhờ đó, các truy vấn lặp đi lặp lại không cần gọi database hay AI Provider — phản hồi gần như tức thời."*

---

## 🟣 BƯỚC 6 — Third Parties: Dịch vụ bên thứ 3 (Trên cùng)

> *"Cuối cùng, nhìn lên góc trên cùng — Backend tích hợp với 2 dịch vụ bên ngoài.*
>
> *Thứ nhất là **Stripe** — cổng thanh toán quốc tế. Khi freelancer nâng cấp tài khoản hoặc client thanh toán hợp đồng, Backend gọi Stripe API để xử lý giao dịch an toàn — tụi em không lưu bất kỳ thông tin thẻ tín dụng nào trên server.*
>
> *Thứ hai là **DeepSeek** — đây là bộ não AI của hệ thống. DeepSeek được dùng để **tự động viết mô tả job** từ tiêu đề ngắn, **gợi ý freelancer phù hợp** dựa trên kỹ năng, và **enhance CV** cho người dùng. Tụi em chọn DeepSeek vì chi phí API thấp hơn GPT-4 nhưng chất lượng output tương đương cho tiếng Anh kỹ thuật."*

---

## ✅ KẾT LUẬN — Nhìn bao quát lại toàn sơ đồ

> *"Tổng kết lại, kiến trúc của AIMarket đạt được 3 mục tiêu thiết kế:*
>
> *Một là **Bảo mật** — Database và Backend hoàn toàn ẩn sau Nginx, không expose ra ngoài.*
>
> *Hai là **Hiệu năng** — SPA giảm tải server, JVM Cache giảm độ trễ cho các tác vụ nặng.*
>
> *Ba là **Linh hoạt AI** — tích hợp DeepSeek rời rạc qua API, dễ dàng thay thế bằng provider khác nếu cần.*
>
> *Em xin kết thúc phần kiến trúc tại đây ạ, thầy cô có câu hỏi gì em xin được giải đáp."*

---

## ❓ CÂU HỎI DỰ PHÒNG (Nếu Giám Khảo Hỏi)

| Câu hỏi | Gợi ý trả lời |
|---|---|
| **Tại sao dùng Nginx thay vì để Spring Boot nhận request trực tiếp?** | "Dạ vì Nginx rất giỏi xử lý static file và load balancing. Tách Nginx ra giúp Backend chỉ tập trung xử lý logic nghiệp vụ, đồng thời có thể mở rộng thêm instance Backend mà không cần thay đổi gì ở phía Client." |
| **Tại sao chọn JVM Cache thay vì Redis?** | "Dạ với quy mô dự án hiện tại — 1 server — JVM Cache đủ đáp ứng và không tốn thêm container. Redis sẽ hợp lý hơn khi cần scale ngang sang nhiều server instance, lúc đó mình sẽ nâng cấp." |
| **Flyway V1–V8 là gì?** | "Dạ Flyway quản lý lịch sử thay đổi schema database theo từng version. Mỗi lần tụi em thêm bảng hay cột mới, sẽ tạo file migration mới — ví dụ V5__add_payment_table.sql — Flyway tự chạy khi app khởi động, đảm bảo DB luôn đồng bộ với code." |
| **WebSocket STOMP dùng cho tính năng gì?** | "Dạ chủ yếu cho **hệ thống chat realtime** giữa client và freelancer, và **thông báo tức thời** khi có proposal mới hoặc hợp đồng được ký." |
| **Tại sao chọn DeepSeek thay vì ChatGPT?** | "Dạ DeepSeek có API cost thấp hơn khoảng 10–20 lần so với GPT-4 Turbo mà chất lượng đầu ra cho nội dung kỹ thuật tiếng Anh rất tốt. Phù hợp với ngân sách của dự án sinh viên ạ." |

---

> 💡 **Mẹo trình bày:**
> - Nói tên công nghệ rõ ràng, dõng dạc: *React 18, Spring Boot 3.3, MySQL 8.0, DeepSeek*
> - Chỉ tay vào đúng khối đang nói — giám khảo rất chú ý điểm này
> - Nếu quên câu, hãy nhìn vào sơ đồ và đọc tên các khối — sơ đồ đã đủ gợi ý
> - Kết thúc mỗi khối bằng 1 câu "lợi ích" ngắn để giám khảo hiểu **tại sao** chọn công nghệ đó
