# Danh Sách Các Ca Kiểm Thử (Test Cases) - AI Freelance Marketplace

Tài liệu này bao gồm danh sách các kịch bản kiểm thử (test cases) để kiểm tra toàn bộ các tính năng của hệ thống AI Freelance Marketplace dựa trên các Sprint và Module đã thiết kế.

---

## 1. Module Xác Thực & Tài Khoản (Auth Module - S1)

### 1.1 Đăng ký tài khoản (Register)
- **TC-AUTH-01:** Đăng ký tài khoản Client thành công với thông tin hợp lệ (Tên, Email, Mật khẩu >= 8 ký tự).
- **TC-AUTH-02:** Đăng ký tài khoản Expert thành công với thông tin hợp lệ.
- **TC-AUTH-03:** Báo lỗi khi đăng ký với email đã tồn tại trong hệ thống.
- **TC-AUTH-04:** Báo lỗi khi mật khẩu xác nhận (Confirm Password) không khớp.

### 1.2 Đăng nhập (Login)
- **TC-AUTH-05:** Đăng nhập thành công với email và mật khẩu đúng. Hệ thống chuyển hướng về đúng giao diện (Client Dashboard / Expert Dashboard).
- **TC-AUTH-06:** Đăng nhập thất bại (báo lỗi 401) khi sai email hoặc mật khẩu.
- **TC-AUTH-07:** Đăng xuất thành công, JWT token bị xóa khỏi storage và blacklist trên Redis.

---

## 2. Module Quản Lý Dự Án (Job Module - S2)

### 2.1 Tạo và Đăng dự án (Post Job - Client)
- **TC-JOB-01:** Client tạo dự án mới thành công. Trạng thái mặc định là `DRAFT` (Nháp).
- **TC-JOB-02:** Validate lỗi khi bỏ trống Tiêu đề, Mô tả hoặc Budget.
- **TC-JOB-03:** Client xuất bản (Publish) dự án thành công. Trạng thái chuyển sang `OPEN`.

### 2.2 Xem và Tìm kiếm dự án (Find Jobs - Public/Expert)
- **TC-JOB-04:** Dự án trạng thái `OPEN` xuất hiện trên trang tìm kiếm (Find Jobs).
- **TC-JOB-05:** Tìm kiếm dự án bằng từ khóa (keyword) hiển thị kết quả chính xác.
- **TC-JOB-06:** Lọc dự án theo khoảng giá (Budget Min/Max) và Kỹ năng (Skills) hoạt động chính xác.
- **TC-JOB-07:** Số lượt xem (View Count) của dự án tự động tăng lên 1 khi người dùng click vào xem chi tiết dự án.

---

## 3. Module Chuyên Gia & Dịch Vụ (Marketplace - S2)

### 3.1 Đăng dịch vụ (Expert)
- **TC-SVC-01:** Expert tạo dịch vụ mới thành công. Trạng thái mặc định là `PENDING_REVIEW` hoặc `INACTIVE`.
- **TC-SVC-02:** Validate các trường bắt buộc (Giá tiền, Số ngày giao hàng, Tag kỹ năng).

### 3.2 Marketplace Tìm Kiếm Dịch Vụ (Public)
- **TC-SVC-03:** Dịch vụ có trạng thái `ACTIVE` hiển thị trên trang Marketplace.
- **TC-SVC-04:** Lọc và tìm kiếm dịch vụ theo từ khóa, mức giá, và thời gian giao hàng.
- **TC-SVC-05:** Client click vào xem chi tiết hồ sơ (Profile) của Expert và danh sách dịch vụ của họ.

---

## 4. Module Đề Xuất & Hợp Đồng (Proposal & Contract - S3)

### 4.1 Gửi & Quản lý đề xuất (Proposal - Expert)
- **TC-PROP-01:** Expert (role EXPERT) gửi đề xuất thành công cho một Job đang ở trạng thái `OPEN`. (Yêu cầu nhập price > 0, timelineDays hợp lệ và coverLetter >= 50 ký tự). Proposal mới sinh ra có status `PENDING`.
- **TC-PROP-02:** Expert bị từ chối gửi đề xuất thứ 2 cho cùng một Job (unique check trên cặp job_id và expert_id).
- **TC-PROP-03:** Rút lại đề xuất (Withdraw). Expert chỉ có thể withdraw proposal khi nó đang ở trạng thái `PENDING`.
- **TC-PROP-04:** Quyền xem danh sách đề xuất. Chỉ có Client (owner của Job) mới có thể gọi API `listProposalsForJob(jobId)`. Kết quả trả về kèm theo thông tin profile của các Expert (rating, avatar). Truy cập trái phép sẽ nhận lỗi `403 Forbidden`.

### 4.2 Ký hợp đồng (Create Contract - Client)
- **TC-CONT-01:** (Luồng chuẩn) Client owner tạo Hợp đồng thành công bằng cách chấp nhận 1 Proposal và truyền danh sách Milestones. Các xử lý Transaction tự động thành công bao gồm:
  1. Contract mới được tạo với trạng thái `ACTIVE`.
  2. Proposal được chọn chuyển thành `ACCEPTED`.
  3. Tất cả các Proposal khác của cùng Job đó tự động chuyển thành `REJECTED`.
  4. Trạng thái Job tự động chuyển thành `IN_PROGRESS`.
  5. Hệ thống gọi `EscrowService.lockFunds()` để khóa đúng số tiền tổng (`totalAmount`) từ số dư của Client.
  6. Milestone được tạo thành công vào DB.
  7. Gửi Notification thành công cho Expert trúng thầu.
- **TC-CONT-02:** Validate quyền: Chỉ Client owner của Job mới có quyền tạo hợp đồng từ Proposal.
- **TC-CONT-03:** Validate trạng thái: Không thể tạo hợp đồng nếu Proposal không ở trạng thái `PENDING` hoặc Job không ở trạng thái `OPEN`.
- **TC-CONT-04:** Phân quyền xem hợp đồng: API `getContract(id)` chỉ trả về kết quả 200 OK nếu người dùng (Client hoặc Expert) chính là thành viên có mặt trong hợp đồng đó.

---

## 5. Module Thanh Toán & Mốc Giao Hàng (Milestones & Payment - S3/S4)

### 5.1 Nạp tiền & Tích hợp Stripe (Client)
- **TC-PAY-01:** Client chọn nạp tiền, hệ thống tạo Stripe Checkout URL.
- **TC-PAY-02:** (Mock mode) Tiền tự động cập nhật vào số dư (Balance) sau vài giây mà không cần thanh toán thật.

### 5.2 Bàn giao & Giải ngân (Milestone Lifecycle)
- **TC-MILE-01:** Expert bấm "Upload Deliverable" và submit link sản phẩm cho Milestone đang `IN_PROGRESS`.
- **TC-MILE-02:** Client bấm "Duyệt" (Approve) Milestone. Tiền trong Escrow tự động chuyển 90% sang cho Expert (10% phí nền tảng).
- **TC-MILE-03:** Client bấm "Từ chối" (Reject), Milestone quay lại trạng thái yêu cầu sửa.
- **TC-MILE-04:** Khi tất cả Milestone đều được Approve, Hợp đồng tự động chuyển sang `COMPLETED`. Job chuyển sang `COMPLETED`.

---

## 6. Module Chat & Thông Báo (Real-time WebSocket - S4)

### 6.1 Chat Real-time
- **TC-CHAT-01:** Client và Expert có thể nhắn tin cho nhau trong phòng Chat của Hợp đồng. Tin nhắn hiển thị ngay lập tức không cần tải lại trang.
- **TC-CHAT-02:** Giao diện hiển thị "Đang gõ..." (Typing indicator) khi đối phương đang gõ chữ.
- **TC-CHAT-03:** Lịch sử chat được lưu trữ và tải lại chính xác khi người dùng mở lại trang.

### 6.2 Notifications (Thông báo)
- **TC-NOTI-01:** Biểu tượng chuông đỏ hiển thị số lượng thông báo chưa đọc tăng lên khi có sự kiện (Hợp đồng mới, Milestone mới, Tin nhắn mới).
- **TC-NOTI-02:** Bấm vào thông báo sẽ đánh dấu là đã đọc (is_read = true) và chuyển hướng đến trang liên quan.

---

## 7. Module Trí Tuệ Nhân Tạo (AI Features - S5)

### 7.1 AI Job Assistant (Client)
- **TC-AI-01:** Client viết một Tiêu đề và Mô tả dự án ngắn (vài chữ). Bấm "AI Enhance".
- **TC-AI-02:** Hệ thống phản hồi lại Tiêu đề hấp dẫn hơn, Mô tả chi tiết, gợi ý Budget và các Kỹ năng còn thiếu. Client bấm "Áp dụng" để đưa nội dung vào form.

### 7.2 AI Expert Recommendation (Client)
- **TC-AI-03:** Trong trang chi tiết Job của mình, Client nhìn thấy khung "AI Đề Xuất Chuyên Gia".
- **TC-AI-04:** Các chuyên gia được gợi ý có bộ kỹ năng (Skills_Embedding) thực sự khớp với yêu cầu của Job thông qua thuật toán Cosine Similarity.
