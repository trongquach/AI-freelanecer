# KỊCH BẢN DEMO HỆ THỐNG AIMARKET (AITASKER)

Tài liệu này mô tả chi tiết các luồng nghiệp vụ chính (Main Flows) của nền tảng AIMarket, được thiết kế để báo cáo và demo trực tiếp cho Giảng viên. Bạn có thể copy toàn bộ nội dung này dán vào MS Word để căn chỉnh lại định dạng nếu cần.

---

## MỞ ĐẦU: GIỚI THIỆU TỔNG QUAN

**Mục tiêu Demo:** Trình bày một hệ sinh thái hoàn chỉnh kết nối giữa người có nhu cầu thuê (Client) và chuyên gia trí tuệ nhân tạo (Expert), bao gồm khả năng ứng dụng AI trong việc tạo nội dung, hệ thống nhắn tin realtime, và luồng thanh toán Escrow an toàn.

**Các Account chuẩn bị sẵn để Demo:**
1. **Client Account** (Khách hàng)
2. **Expert Account** (Chuyên gia AI)
3. **Admin Account** (Quản trị viên)

---

## KỊCH BẢN 1: LUỒNG THUÊ CHUYÊN GIA THEO DỰ ÁN (PROJECT-BASED FLOW)
*Mô phỏng quá trình Client đăng việc và chọn Expert.*

### 1. Vai Client (Đăng việc bằng AI)
- **Đăng nhập** tài khoản Client.
- Vào mục **Post a Job** (Đăng việc).
- **Điểm nhấn AI:** Nhập một câu yêu cầu ngắn gọn (VD: *"Tôi cần làm một con chatbot tư vấn bất động sản"*). Bấm nút **AI Enhance** để hệ thống gọi AI tự động viết lại thành một Job Description chi tiết, chuyên nghiệp và đưa ra gợi ý về Ngân sách (Budget) + Kỹ năng (Skills).
- Client **Publish** dự án lên sàn.

### 2. Vai Expert (Nộp báo giá - Proposal)
- Mở trình duyệt khác (hoặc tab ẩn danh), **Đăng nhập** tài khoản Expert.
- Expert nhận được thông báo (Notification realtime) về Job mới hoặc chủ động tìm kiếm Job trên sàn.
- Bấm vào Job vừa tạo, tiến hành **Submit Proposal**: nhập số tiền báo giá, thời gian hoàn thành và lời chào (Cover letter).

### 3. Vai Client (Ký Hợp đồng & Escrow)
- Quay lại tài khoản Client, vào mục quản lý dự án để xem các Proposal đã nhận.
- Xem hồ sơ (Portfolio) của Expert và bấm **Accept** (Chấp nhận) Proposal.
- **Điểm nhấn Thanh toán:** Hệ thống yêu cầu Client nạp tiền vào ví bằng thẻ Visa (thông qua cổng thanh toán Stripe).
- Khi thanh toán thành công, hệ thống tự động:
  - Sinh ra một **Hợp đồng (Contract)**.
  - Chuyển số tiền của hợp đồng vào trạng thái **LOCKED (Escrow)** để đảm bảo an toàn cho cả 2 bên.

---

## KỊCH BẢN 2: LUỒNG MUA DỊCH VỤ CÓ SẴN (SERVICE-BASED FLOW)
*Mô phỏng quá trình Expert đóng gói dịch vụ và Client mua đứt.*

### 1. Vai Expert (Tạo Dịch vụ mới)
- Expert vào phần **My Services**, tạo một Gói Dịch vụ mới (Gig).
- **Điểm nhấn AI:** Sử dụng nút **AI Generator** để tự động tạo tiêu đề bắt mắt và mô tả hấp dẫn (VD: *"Xây dựng hệ thống RAG với dữ liệu nội bộ trong 3 ngày"*).
- Publish dịch vụ lên Marketplace.

### 2. Vai Client (Mua Dịch vụ)
- Client dạo vòng quanh Marketplace (phần Khám phá Dịch vụ).
- Xem chi tiết Gói Dịch vụ của Expert. Bấm **Order (Mua ngay)**.
- Tiến hành thanh toán qua Ví điện tử. Hệ thống lập tức sinh ra Hợp đồng (Contract) để hai bên bắt đầu làm việc.

---

## KỊCH BẢN 3: THỰC HIỆN HỢP ĐỒNG, CỘT MỐC & NGHIỆM THU
*Quá trình làm việc, giao tiếp và thanh toán tự động.*

### 1. Nhắn tin trao đổi (Real-time Chat)
- Client và Expert sử dụng kênh **Chat riêng** của Hợp đồng để trao đổi yêu cầu (Sử dụng WebSocket/STOMP, tin nhắn hiện ngay lập tức không cần tải lại trang).

### 2. Vai Expert (Nộp sản phẩm)
- Sau khi code xong, Expert vào màn hình Hợp đồng.
- Bấm vào Milestone tương ứng và chọn **Submit Work** (Gửi link demo, file báo cáo).

### 3. Vai Client (Nghiệm thu & Giải ngân)
- Client xem thông báo, vào kiểm tra sản phẩm của Expert.
- Nếu hài lòng, Client bấm **Approve Milestone** (Duyệt nghiệm thu).
- **Luồng tiền:** Hệ thống tự động chuyển số tiền từ trạng thái Khóa (Escrow) sang số dư Khả dụng trong Ví của Expert. Trạng thái giao dịch chuyển thành **RELEASED**.

### 4. Đánh giá (Review)
- Khi toàn bộ các Cột mốc (Milestones) hoàn thành, Client viết Nhận xét (Review) và chấm sao (Rating) cho Expert. Đánh giá này sẽ hiển thị trên Profile công khai của Expert.

---

## KỊCH BẢN 4: RÚT TIỀN, QUẢN TRỊ & GIẢI QUYẾT TRANH CHẤP
*Thể hiện khả năng vận hành và bảo vệ rủi ro của hệ thống.*

### 1. Vai Expert (Rút tiền - Withdraw)
- Expert vào Ví của mình, tạo một lệnh **Withdraw** toàn bộ số tiền đã kiếm được về tài khoản ngân hàng thực.
- Trạng thái lệnh rút ở mức PENDING chờ duyệt.

### 2. Vai Client/Expert (Khiếu nại - Dispute)
- Demo một hợp đồng đang dang dở nhưng Client không hài lòng với thái độ của Expert. Client bấm **Open Dispute** (Mở khiếu nại).
- Tiền trong Escrow tiếp tục bị đóng băng, hợp đồng bị đình chỉ.

### 3. Vai Admin (Quản trị hệ thống)
- **Đăng nhập** tài khoản Admin.
- Xem tổng quan các giao dịch tiền tệ (Dashboard).
- Vào phần **Withdraw Requests**, bấm **Approve** để duyệt lệnh rút tiền cho Expert ban nãy.
- Vào phần **Disputes**, xem xét bằng chứng đoạn chat của hợp đồng có tranh chấp. Đưa ra phán quyết:
  - Nếu lỗi do Expert: Bấm **Refund**, tiền tự động hoàn trả về ví Client.
  - Nếu lỗi do Client: Bấm **Payout**, tiền tự động chuyển cho Expert.

---

## TỔNG KẾT DEMO
**Nhấn mạnh với giảng viên các tính năng ăn điểm:**
1. Áp dụng AI thực tế (GenAI API) giúp tối ưu hóa UX chứ không chỉ là chat bot cơ bản.
2. Thiết kế cơ sở dữ liệu luồng tiền Escrow chặt chẽ (Funded -> Locked -> Released / Refunded).
3. Đầy đủ các luồng end-to-end từ lúc tìm kiếm, ký kết, làm việc đến lúc kết thúc thanh lý hợp đồng.
4. Có Realtime Notification & Chat.
