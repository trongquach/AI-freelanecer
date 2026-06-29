# Tập Hợp Quy Tắc Nghiệp Vụ (Business Rules) - AITasker Platform

Dựa trên yêu cầu gốc của dự án **AI Marketplace Platform for AI Automation Services (AITasker)**, dưới đây là bộ Quy tắc nghiệp vụ (Business Rules - BR) chuẩn chỉnh, được chia theo từng module để đưa vào tài liệu Software Requirements Specification (SRS).

## 1. Quản lý Người dùng & Phân quyền (User & Role Management)
* **BR-USR-01 (Định danh vai trò):** Một người dùng khi đăng ký phải chọn vai trò (Role) chính là `Client` hoặc `AI Expert`. Vai trò `Admin` chỉ được cấp phát thủ công bởi Super Admin của hệ thống.
* **BR-USR-02 (Xác thực tài khoản):** Người dùng bắt buộc phải xác thực email trước khi có thể sử dụng các chức năng cốt lõi (Client tạo Job, Expert tạo Service/gửi Proposal).
* **BR-USR-03 (Điều kiện hoạt động của Expert):** AI Expert phải hoàn thiện ít nhất 70% thông tin Profile (Bao gồm kỹ năng, giới thiệu và ít nhất 1 portfolio/service) trước khi hệ thống cho phép nộp Proposal hoặc xuất hiện trong danh sách đề xuất (AI Expert Recommendation).

## 2. Quản lý Công việc & Báo giá (Job & Proposal Management)
* **BR-JOB-01 (Tạo công việc):** Chỉ người dùng có vai trò `Client` mới có quyền tạo và đăng tải Job Posting.
* **BR-JOB-02 (Ràng buộc thông tin Job):** Một Job Posting hợp lệ bắt buộc phải có đủ các trường: Tiêu đề (Title), Mô tả (Description), Ngân sách dự kiến (Budget), Thời hạn (Timeline), và Kỹ năng yêu cầu (Skills).
* **BR-JOB-03 (Khóa thay đổi ngân sách):** Client không được phép chỉnh sửa trường Ngân sách (Budget) của Job sau khi đã có ít nhất một Proposal được gửi tới.
* **BR-JOB-04 (Giới hạn Proposal):** Mỗi AI Expert chỉ được phép gửi tối đa một (01) Proposal cho một Job Posting.
* **BR-JOB-05 (Thay đổi trạng thái Job):** Khi Client chọn "Chấp nhận" (Accept) một Proposal và thanh toán tiền cọc (Escrow) thành công, trạng thái của Job sẽ tự động chuyển từ `Open` sang `In Progress`, và các Proposal khác sẽ tự động bị từ chối (Rejected).

## 3. Chợ Dịch Vụ AI (AI Service Marketplace)
* **BR-SRV-01 (Đăng dịch vụ):** Chỉ `AI Expert` mới có quyền tạo và đăng các gói dịch vụ AI (AI Services).
* **BR-SRV-02 (Mua dịch vụ trực tiếp):** Client có thể mua trực tiếp một Service thông qua việc thanh toán 100% giá trị Service vào tài khoản trung gian (Escrow) của hệ thống. Ngay sau khi thanh toán, hệ thống sẽ tự động tạo ra một `Project` tương ứng.

## 4. Quản lý Dự án & Tiến độ (Project & Milestone Management)
* **BR-PRJ-01 (Khởi tạo dự án):** Bất kỳ `Project` nào được tạo ra đều phải liên kết với một `Job Posting` (thông qua Proposal) hoặc một `Service`. Không có dự án nào được tồn tại độc lập.
* **BR-PRJ-02 (Ràng buộc Milestone):** Trong các dự án chia theo từng giai đoạn (Milestones), AI Expert chỉ có thể bắt đầu làm việc ở Milestone `N+1` sau khi Client đã duyệt (Approve) và hệ thống đã giải ngân cho Milestone `N`.
* **BR-PRJ-03 (Xác nhận hoàn thành):** Khi Expert submit sản phẩm, Client có thời hạn tối đa 07 ngày để xem xét (Review). Nếu quá 07 ngày Client không có phản hồi, hệ thống sẽ tự động chuyển trạng thái Milestone/Project thành `Completed` (Auto-approval).

## 5. Tài chính & Thanh toán an toàn (Financial & Escrow Rules)
* **BR-FIN-01 (Giao dịch bắt buộc qua hệ thống):** Mọi giao dịch tiền tệ giữa Client và AI Expert bắt buộc phải được xử lý qua hệ thống Escrow của nền tảng để đảm bảo tính an toàn (Trust).
* **BR-FIN-02 (Quy tắc giữ tiền - Hold Funds):** Tiền của Client phải được nạp và khóa (Frozen/Hold) trong hệ thống Escrow *trước khi* Expert bắt đầu thực hiện công việc.
* **BR-FIN-03 (Giải ngân - Release Funds):** Hệ thống chỉ giải ngân (chuyển tiền từ Escrow sang ví của Expert) khi và chỉ khi Client nhấn nút "Approve" (Chấp nhận sản phẩm) hoặc khi thời gian Auto-approval (BR-PRJ-03) có hiệu lực.
* **BR-FIN-04 (Phí nền tảng - Platform Fee):** Hệ thống sẽ tự động khấu trừ một khoản phí hoa hồng (Ví dụ: 10% - 20% dựa trên cấu hình) trên tổng số tiền giải ngân cho Expert ở mỗi giao dịch thành công.

## 6. Đánh giá & Giải quyết tranh chấp (Review & Dispute)
* **BR-REV-01 (Điều kiện đánh giá):** Tính năng Đánh giá & Chấm điểm (Review & Rating) chỉ được mở khi Project kết thúc với trạng thái `Completed` hoặc `Cancelled` có thanh toán một phần.
* **BR-REV-02 (Không chỉnh sửa Review):** Client và Expert không thể tự ý sửa đổi hoặc xóa Đánh giá sau khi đã Submit. Chỉ có Admin mới có quyền gỡ bỏ đánh giá nếu vi phạm Tiêu chuẩn cộng đồng.
* **BR-DSP-01 (Đóng băng khi tranh chấp):** Bất cứ khi nào Client hoặc Expert khởi tạo một yêu cầu Tranh chấp (Dispute), toàn bộ số tiền đang nằm trong Escrow của dự án đó sẽ lập tức bị đóng băng (Locked).
* **BR-DSP-02 (Quyền quyết định Dispute):** Admin là người duy nhất có quyền quyết định tỷ lệ hoàn tiền/giải ngân cuối cùng dựa trên bằng chứng (messages, deliverables) do hai bên cung cấp. Quyết định của Admin là quyết định cuối cùng.

## 7. Quy tắc cho các Module AI (AI System Rules)
* **BR-AI-01 (Tính gợi ý của AI Assistant):** Module `AI Job Assistant` và `AI Service Generator` chỉ đóng vai trò hỗ trợ sinh văn bản và gợi ý (skills, budget). Người dùng (Client/Expert) có toàn quyền chỉnh sửa và bắt buộc phải xác nhận nội dung trước khi Publish. Nền tảng không chịu trách nhiệm về nội dung do AI tạo ra.
* **BR-AI-02 (AI Recommendation):** Module `AI Expert Recommendation` phải ưu tiên gợi ý các AI Expert có điểm đánh giá (Rating) cao, tỷ lệ hoàn thành dự án tốt và có các skills (kỹ năng) matching chính xác với yêu cầu của Job Posting. Không được phép recommend Expert đang bị khóa tài khoản (Banned/Suspended).
