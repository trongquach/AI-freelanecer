# TEST CASES - AI SERVICES MARKETPLACE PLATFORM

**Dự án:** AI Services Marketplace  
**Phiên bản:** 1.0  
**Ngày tạo:** 30/05/2026  
**Người tạo:** QA Team  

---

## MỤC LỤC

1. [Client Side](#1-client-side)
   - 1.1 [Tạo Job Posting](#11-tạo-job-posting)
   - 1.2 [Browse AI Services Marketplace](#12-browse-ai-services-marketplace)
   - 1.3 [Hire Expert & Manage Projects](#13-hire-expert--manage-projects)
   - 1.4 [Track Milestones & Approve Deliverables](#14-track-milestones--approve-deliverables)
   - 1.5 [Messaging System](#15-messaging-system)
   - 1.6 [Secure Payment via Escrow](#16-secure-payment-via-escrow)
   - 1.7 [Transaction History & Reviews](#17-transaction-history--reviews)
2. [Expert Side](#2-expert-side)
   - 2.1 [Create Profile & Portfolio](#21-create-profile--portfolio)
   - 2.2 [Publish AI Services](#22-publish-ai-services)
   - 2.3 [Submit Proposals for Jobs](#23-submit-proposals-for-jobs)
   - 2.4 [Manage Projects & Deliverables](#24-manage-projects--deliverables)
   - 2.5 [Track Earnings & Withdraw Money](#25-track-earnings--withdraw-money)
3. [AI Modules](#3-ai-modules)
   - 3.1 [AI Job Assistant](#31-ai-job-assistant)
   - 3.2 [AI Service Generator](#32-ai-service-generator)
   - 3.3 [AI Expert Recommendation](#33-ai-expert-recommendation)
4. [Admin](#4-admin)
   - 4.1 [Manage Users](#41-manage-users)
   - 4.2 [Manage Jobs & Services](#42-manage-jobs--services)
   - 4.3 [Handle Disputes](#43-handle-disputes)
   - 4.4 [Monitor Transactions & Analytics](#44-monitor-transactions--analytics)

---

## LEGEND

| Ký hiệu | Ý nghĩa |
|---------|---------|
| TC | Test Case |
| P | Priority: High (H) / Medium (M) / Low (L) |
| ✅ Pass | Kết quả mong đợi đạt |
| ❌ Fail | Kết quả mong đợi không đạt |

---

## 1. CLIENT SIDE

### 1.1 Tạo Job Posting

---

#### TC-JOB-001: Tạo job posting thành công với đầy đủ thông tin hợp lệ
**Priority:** H  
**Precondition:** User đã đăng nhập với vai trò Client

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Nhấn nút "Post a Job" trên dashboard | Hiển thị form tạo job posting |
| 2 | Nhập Title: "Build a ChatGPT-powered Customer Support Bot" | Field title hiển thị đúng nội dung |
| 3 | Nhập Description đầy đủ mô tả yêu cầu (>50 ký tự) | Field description nhận input |
| 4 | Nhập Budget: $500 | Field budget hiển thị $500 |
| 5 | Chọn Timeline: "2 weeks" | Dropdown hiển thị lựa chọn đã chọn |
| 6 | Thêm Skills: "Python", "NLP", "OpenAI API" | Tags skills hiển thị đúng |
| 7 | Nhấn "Submit" | Job được tạo thành công với trạng thái **DRAFT**, redirect sang trang job detail |
| 8 | Nhấn "🚀 Publish Project" trên trang chi tiết | Job chuyển sang trạng thái **OPEN** |

**Expected Result:** Job posting xuất hiện trên marketplace, trạng thái "Open" (sau khi client publish từ trang chi tiết)

> **Ghi chú (Actual Behavior):** Hệ thống tạo job ở trạng thái `DRAFT`. Client phải vào trang chi tiết job và nhấn nút "🚀 Publish Project" mới chuyển sang trạng thái `OPEN` và hiển thị trên marketplace.

---

#### TC-JOB-002: Tạo job posting thất bại khi thiếu Title
**Priority:** H  
**Precondition:** User đã đăng nhập với vai trò Client

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Mở form tạo job posting | Form hiển thị |
| 2 | Bỏ trống field Title | Field rỗng |
| 3 | Điền đầy đủ các field còn lại | Các field khác hợp lệ |
| 4 | Nhấn "Submit" | Hiển thị lỗi: "Title is required" dưới field Title |

**Expected Result:** Form không submit, con trỏ focus vào field Title

---

#### TC-JOB-003: Tạo job posting thất bại khi Budget âm hoặc bằng 0
**Priority:** H  
**Precondition:** User đã đăng nhập với vai trò Client

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Mở form tạo job posting | Form hiển thị |
| 2 | Nhập Budget: -100 | Field nhận giá trị |
| 3 | Nhấn "Submit" | Hiển thị lỗi: "Budget must be greater than 0" |
| 4 | Xóa, nhập Budget: 0 | Field nhận giá trị |
| 5 | Nhấn "Submit" | Hiển thị lỗi: "Budget must be greater than 0" |

**Expected Result:** Validation ngăn không cho submit budget không hợp lệ

---

#### TC-JOB-004: Tạo job posting với Title vượt quá độ dài tối đa
**Priority:** M  
**Precondition:** User đã đăng nhập với vai trò Client

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Mở form tạo job posting | Form hiển thị |
| 2 | Nhập Title dài hơn 255 ký tự | Field chỉ nhận tối đa 255 ký tự HOẶC hiển thị lỗi khi submit |
| 3 | Nhấn "Submit" | Hiển thị lỗi giới hạn ký tự |

**Expected Result:** System giới hạn hoặc cảnh báo độ dài title

---

#### TC-JOB-005: Tạo job posting thất bại khi thiếu Skills
**Priority:** M  
**Precondition:** User đã đăng nhập với vai trò Client

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Mở form tạo job posting | Form hiển thị |
| 2 | Điền Title, Description, Budget, Timeline | Các field hợp lệ |
| 3 | Bỏ trống Skills | Field skills rỗng |
| 4 | Nhấn "Submit" | Hiển thị lỗi: "At least one skill is required" |

**Expected Result:** Form không submit khi thiếu skills

---

#### TC-JOB-006: Chỉnh sửa job posting đã tạo
**Priority:** M  
**Precondition:** Client đã có job posting ở trạng thái "Open"

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Vào trang quản lý job của mình | Danh sách job hiển thị |
| 2 | Nhấn "Edit" trên job cần sửa | Form edit mở ra với dữ liệu hiện tại |
| 3 | Sửa Budget từ $500 lên $800 | Field budget cập nhật |
| 4 | Nhấn "Save" | Thông báo "Job updated successfully" |
| 5 | Kiểm tra trang job detail | Budget hiển thị $800 |

**Expected Result:** Job posting được cập nhật và hiển thị đúng thông tin mới

---

#### TC-JOB-007: Xóa job posting
**Priority:** M  
**Precondition:** Client đã có job posting chưa có proposal nào

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Vào trang quản lý job | Danh sách job hiển thị |
| 2 | Nhấn "Delete" trên job cần xóa | Dialog xác nhận hiển thị |
| 3 | Nhấn "Confirm" | Job bị xóa khỏi danh sách |
| 4 | Kiểm tra marketplace | Job không còn hiển thị |

**Expected Result:** Job bị xóa hoàn toàn khỏi hệ thống

---

### 1.2 Browse AI Services Marketplace

---

#### TC-MKT-001: Xem danh sách AI services trên marketplace
**Priority:** H  
**Precondition:** User đã đăng nhập (bất kỳ role)

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Truy cập trang Marketplace | Danh sách services hiển thị dạng card/grid |
| 2 | Quan sát thông tin mỗi service card | Hiển thị: tên service, tên expert, giá, rating, ảnh thumbnail |
| 3 | Scroll xuống cuối trang | Phân trang hoặc load more hoạt động |

**Expected Result:** Marketplace load đầy đủ services, hiển thị thông tin cơ bản

---

#### TC-MKT-002: Tìm kiếm service theo keyword
**Priority:** H  
**Precondition:** Có ít nhất 5 services trên marketplace

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Nhập keyword "chatbot" vào ô tìm kiếm | Ô search nhận input |
| 2 | Nhấn Enter hoặc icon Search | Kết quả lọc theo keyword |
| 3 | Kiểm tra kết quả trả về | Chỉ hiển thị services có "chatbot" trong title/description |
| 4 | Xóa keyword, search rỗng | Hiển thị lại toàn bộ services |

**Expected Result:** Tìm kiếm hoạt động chính xác theo keyword

---

#### TC-MKT-003: Lọc services theo category
**Priority:** H  
**Precondition:** Marketplace có services thuộc nhiều category

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Nhấn vào filter "Category" | Dropdown/sidebar hiển thị danh sách category |
| 2 | Chọn category "NLP" | Services được lọc |
| 3 | Kiểm tra kết quả | Chỉ hiển thị services thuộc NLP |
| 4 | Bỏ chọn filter | Tất cả services hiển thị lại |

**Expected Result:** Filter category hoạt động đúng

---

#### TC-MKT-004: Lọc services theo khoảng giá
**Priority:** M  
**Precondition:** Marketplace có services với nhiều mức giá

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Mở filter "Price Range" | Bộ lọc giá hiển thị (slider hoặc input) |
| 2 | Đặt min: $50, max: $200 | Filter áp dụng |
| 3 | Kiểm tra kết quả | Chỉ hiển thị services có giá trong khoảng $50-$200 |

**Expected Result:** Filter giá hoạt động chính xác

---

#### TC-MKT-005: Xem chi tiết một service
**Priority:** H  
**Precondition:** Marketplace có ít nhất 1 service

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Click vào một service card | Trang chi tiết service mở |
| 2 | Kiểm tra thông tin hiển thị | Hiển thị: title, mô tả đầy đủ, giá, rating, portfolio expert, reviews |
| 3 | Kiểm tra nút hành động | Có nút "Order Now" hoặc "Contact Expert" |

**Expected Result:** Trang chi tiết service hiển thị đầy đủ thông tin

---

#### TC-MKT-006: Sắp xếp services theo rating
**Priority:** M  
**Precondition:** Marketplace có services với rating khác nhau

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Chọn "Sort by: Rating" | Dropdown sort hiển thị |
| 2 | Chọn "Highest Rated" | Danh sách sắp xếp lại |
| 3 | Kiểm tra thứ tự | Service có rating cao nhất xuất hiện đầu tiên |

**Expected Result:** Sắp xếp theo rating đúng thứ tự giảm dần

---

### 1.3 Hire Expert & Manage Projects

---

#### TC-HIRE-001: Thuê expert từ marketplace
**Priority:** H  
**Precondition:** Client đã đăng nhập, có service cần order

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Vào trang chi tiết service | Trang service hiển thị |
| 2 | Nhấn "Order Now" | Form order hiển thị |
| 3 | Điền requirements và timeline | Form nhận input |
| 4 | Xác nhận payment | Thanh toán qua escrow |
| 5 | Nhấn "Confirm Order" | Order được tạo, project bắt đầu |

**Expected Result:** Project được tạo, cả Client và Expert nhận thông báo

---

#### TC-HIRE-002: Xem danh sách dự án đang quản lý
**Priority:** H  
**Precondition:** Client đã có ít nhất 1 project active

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Vào "My Projects" trên dashboard | Danh sách projects hiển thị |
| 2 | Kiểm tra thông tin mỗi project | Hiển thị: tên project, expert, trạng thái, deadline |
| 3 | Click vào một project | Trang chi tiết project mở |

**Expected Result:** Dashboard hiển thị đúng danh sách và trạng thái project

---

#### TC-HIRE-003: Xem proposal từ các experts
**Priority:** H  
**Precondition:** Client có job posting đã nhận được proposals

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Vào trang job detail | Trang job hiển thị |
| 2 | Click tab "Proposals" | Danh sách proposals hiển thị |
| 3 | Kiểm tra mỗi proposal | Hiển thị: tên expert, bid amount, cover letter, timeline |
| 4 | Nhấn "View Profile" của một expert | Trang profile expert mở |
| 5 | Nhấn "Accept Proposal" | Xác nhận thuê expert |

**Expected Result:** Client có thể review và chấp nhận proposal

---

#### TC-HIRE-004: Từ chối proposal
**Priority:** M  
**Precondition:** Client có job posting đã nhận được proposals

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Vào tab Proposals của job | Danh sách proposals hiển thị |
| 2 | Nhấn "Decline" trên một proposal | Dialog xác nhận hiển thị |
| 3 | Có thể nhập lý do từ chối (optional) | Textbox lý do xuất hiện |
| 4 | Nhấn "Confirm Decline" | Proposal bị từ chối, expert nhận thông báo |

**Expected Result:** Proposal bị từ chối, expert nhận notification

---

### 1.4 Track Milestones & Approve Deliverables

---

#### TC-MILE-001: Xem milestone của dự án
**Priority:** H  
**Precondition:** Có project active với milestones đã được định nghĩa

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Vào trang chi tiết project | Project detail hiển thị |
| 2 | Click vào tab "Milestones" | Danh sách milestones hiển thị dạng timeline |
| 3 | Kiểm tra thông tin milestone | Hiển thị: tên, mô tả, deadline, trạng thái, % hoàn thành |

**Expected Result:** Timeline milestone hiển thị đúng thứ tự và trạng thái

---

#### TC-MILE-002: Approve deliverable từ expert
**Priority:** H  
**Precondition:** Expert đã submit deliverable cho milestone

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Nhận thông báo "Deliverable Submitted" | Notification hiển thị |
| 2 | Vào project → Milestones | Milestone có status "Pending Review" |
| 3 | Click "Review Deliverable" | File/link deliverable hiển thị để review |
| 4 | Kiểm tra deliverable | Client review nội dung |
| 5 | Nhấn "Approve" | Milestone được đánh dấu hoàn thành |

**Expected Result:** Milestone status chuyển "Completed", payment được release

---

#### TC-MILE-003: Yêu cầu chỉnh sửa deliverable
**Priority:** H  
**Precondition:** Expert đã submit deliverable cho milestone

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Vào trang review deliverable | Nội dung deliverable hiển thị |
| 2 | Nhấn "Request Revision" | Form nhập feedback hiển thị |
| 3 | Nhập feedback chi tiết | Textbox nhận input |
| 4 | Nhấn "Submit Revision Request" | Expert nhận thông báo revision request |

**Expected Result:** Status milestone chuyển "Revision Requested", expert nhận feedback

---

#### TC-MILE-004: Theo dõi tiến độ dự án tổng thể
**Priority:** M  
**Precondition:** Có project đang active

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Vào trang chi tiết project | Project detail hiển thị |
| 2 | Quan sát progress bar | Progress bar hiển thị % hoàn thành |
| 3 | Kiểm tra tính chính xác | % = (số milestone completed / tổng milestone) × 100 |

**Expected Result:** Progress bar phản ánh đúng tỷ lệ milestone đã hoàn thành

---

### 1.5 Messaging System

---

#### TC-MSG-001: Gửi tin nhắn real-time đến expert
**Priority:** H  
**Precondition:** Client đã có project với expert

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Vào trang Messages hoặc project chat | Giao diện chat hiển thị |
| 2 | Nhập tin nhắn "Hello, please start with the design phase" | Textbox nhận input |
| 3 | Nhấn Enter hoặc Send | Tin nhắn hiển thị phía bên phải (sender side) |
| 4 | Expert mở chat (hoặc verify qua session khác) | Tin nhắn xuất hiện ở phía Expert ngay lập tức |

**Expected Result:** Tin nhắn được gửi real-time, không cần refresh

---

#### TC-MSG-002: Gửi file attachment trong chat
**Priority:** M  
**Precondition:** Client đang trong conversation với expert

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Nhấn icon Attach File trong chat | File picker mở |
| 2 | Chọn file PDF (< 10MB) | File được chọn |
| 3 | Nhấn Send | File được upload và hiển thị trong chat |
| 4 | Expert click vào file | File download thành công |

**Expected Result:** File được đính kèm và người nhận có thể download

---

#### TC-MSG-003: Gửi file attachment vượt quá dung lượng cho phép
**Priority:** M  
**Precondition:** Client đang trong conversation

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Nhấn icon Attach File | File picker mở |
| 2 | Chọn file > 50MB | File được chọn |
| 3 | Nhấn Send | Thông báo lỗi "File size exceeds the limit" |

**Expected Result:** System từ chối file quá lớn và thông báo rõ ràng

---

#### TC-MSG-004: Xem lịch sử tin nhắn
**Priority:** M  
**Precondition:** Client đã có lịch sử chat với expert

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Mở lại conversation với expert | Toàn bộ lịch sử tin nhắn hiển thị |
| 2 | Scroll lên đầu cuộc hội thoại | Tin nhắn cũ nhất được load (pagination nếu cần) |
| 3 | Kiểm tra timestamp | Mỗi tin nhắn có thời gian gửi |

**Expected Result:** Lịch sử chat được lưu và hiển thị đúng thứ tự

---

#### TC-MSG-005: Hiển thị trạng thái đã đọc/chưa đọc
**Priority:** L  
**Precondition:** Client có tin nhắn mới chưa đọc từ expert

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Quan sát inbox | Conversation có tin nhắn mới hiển thị badge số lượng chưa đọc |
| 2 | Mở conversation | Badge biến mất |
| 3 | Tin nhắn vừa mở | Được đánh dấu "Read" |

**Expected Result:** Trạng thái đọc/chưa đọc cập nhật chính xác

---

### 1.6 Secure Payment via Escrow

---

#### TC-PAY-001: Thanh toán thành công qua escrow
**Priority:** H  
**Precondition:** Client đã chọn expert và confirm order, có phương thức thanh toán hợp lệ

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Chọn phương thức thanh toán (Credit Card/PayPal) | Trang payment hiển thị |
| 2 | Nhập thông tin thẻ hợp lệ | Form nhận input |
| 3 | Nhấn "Pay Now" | Processing indicator hiển thị |
| 4 | Thanh toán hoàn tất | Thông báo "Payment Successful" |
| 5 | Kiểm tra project status | Status chuyển "Active", tiền vào escrow |

**Expected Result:** Tiền được giữ trong escrow, không chuyển thẳng cho expert

---

#### TC-PAY-002: Thanh toán thất bại do thẻ không hợp lệ
**Priority:** H  
**Precondition:** Client đang ở trang thanh toán

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Nhập số thẻ không hợp lệ: "1234 5678 9012 3456" | Form nhận input |
| 2 | Điền đầy đủ thông tin còn lại | Các field khác hợp lệ |
| 3 | Nhấn "Pay Now" | Thông báo lỗi "Invalid card number" |

**Expected Result:** Transaction không được tạo, tiền không bị trừ

---

#### TC-PAY-003: Release payment sau khi approve milestone
**Priority:** H  
**Precondition:** Client đã approve milestone cuối cùng của project

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Approve milestone cuối cùng | Milestone status = Completed |
| 2 | Xác nhận hoàn thành project | Dialog xác nhận hiển thị |
| 3 | Nhấn "Release Payment" | Tiền từ escrow chuyển đến expert |
| 4 | Kiểm tra transaction history | Có bản ghi "Payment Released to [Expert name]" |

**Expected Result:** Tiền được release từ escrow đến tài khoản expert

---

#### TC-PAY-004: Yêu cầu hoàn tiền (refund)
**Priority:** H  
**Precondition:** Project bị huỷ trước khi bắt đầu hoặc expert không deliver

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Vào project detail | Project detail hiển thị |
| 2 | Nhấn "Request Refund" | Form refund request hiển thị |
| 3 | Chọn lý do refund | Dropdown lý do hiển thị |
| 4 | Nhập mô tả chi tiết | Textbox nhận input |
| 5 | Submit | Yêu cầu refund được gửi đến Admin |

**Expected Result:** Refund request được ghi nhận, tiền escrow được giữ chờ Admin xử lý

---

### 1.7 Transaction History & Reviews

---

#### TC-TXN-001: Xem lịch sử giao dịch
**Priority:** H  
**Precondition:** Client đã có ít nhất 1 giao dịch hoàn thành

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Vào "Billing" hoặc "Transaction History" | Danh sách transactions hiển thị |
| 2 | Kiểm tra thông tin từng transaction | Hiển thị: ngày, mô tả, số tiền, trạng thái |
| 3 | Lọc theo khoảng thời gian | Chỉ hiển thị transactions trong khoảng đã chọn |

**Expected Result:** Lịch sử giao dịch đầy đủ, có thể lọc và search

---

#### TC-REV-001: Để lại review cho expert sau khi hoàn thành project
**Priority:** H  
**Precondition:** Project đã hoàn thành và payment đã được release

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Nhận thông báo "Leave a Review" hoặc vào project completed | Trang review hiển thị |
| 2 | Chọn rating: 5 sao | Stars highlight tương ứng |
| 3 | Nhập nhận xét: "Excellent work, delivered on time!" | Textbox nhận input |
| 4 | Nhấn "Submit Review" | Thông báo "Review submitted" |
| 5 | Kiểm tra profile expert | Review mới xuất hiện |

**Expected Result:** Review hiển thị trên profile expert, rating được cập nhật

---

#### TC-REV-002: Không thể để review trùng lặp cho cùng project
**Priority:** M  
**Precondition:** Client đã để review cho project X

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Cố gắng truy cập trang review của project X lần 2 | Hệ thống kiểm tra |
| 2 | Quan sát UI | Nút "Leave Review" bị ẩn/disabled |
| 3 | Hoặc cố submit review qua API | Trả về lỗi "Review already submitted" |

**Expected Result:** System ngăn chặn duplicate review

---

## 2. EXPERT SIDE

### 2.1 Create Profile & Portfolio

---

#### TC-PRO-001: Tạo profile expert thành công
**Priority:** H  
**Precondition:** User đã đăng ký tài khoản với vai trò Expert

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Vào trang "Setup Profile" | Form profile hiển thị |
| 2 | Upload ảnh đại diện (JPG, < 5MB) | Ảnh preview hiển thị |
| 3 | Nhập tên: "Nguyen Van A" | Field nhận input |
| 4 | Nhập bio/introduction | Textarea nhận input |
| 5 | Thêm skills: "Machine Learning", "TensorFlow" | Tags skills hiển thị |
| 6 | Nhập hourly rate: $50 | Field nhận input |
| 7 | Nhấn "Save Profile" | Profile được lưu, redirect sang public profile |

**Expected Result:** Profile expert hiển thị đúng trên marketplace

---

#### TC-PRO-002: Thêm portfolio item
**Priority:** H  
**Precondition:** Expert đã có profile

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Vào tab "Portfolio" trên trang profile | Trang portfolio hiển thị |
| 2 | Nhấn "Add Portfolio Item" | Form thêm portfolio hiển thị |
| 3 | Nhập tiêu đề: "AI Chatbot for E-commerce" | Field nhận input |
| 4 | Upload ảnh minh họa | Ảnh preview hiển thị |
| 5 | Nhập mô tả dự án | Textarea nhận input |
| 6 | Thêm link demo (optional) | Field URL nhận input |
| 7 | Nhấn "Save" | Portfolio item được thêm vào profile |

**Expected Result:** Portfolio item hiển thị trên public profile của expert

---

#### TC-PRO-003: Upload ảnh đại diện sai định dạng
**Priority:** M  
**Precondition:** Expert đang edit profile

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Nhấn "Upload Avatar" | File picker mở |
| 2 | Chọn file .exe hoặc .pdf | File được chọn |
| 3 | Confirm upload | Thông báo lỗi "Only JPG, PNG files are allowed" |

**Expected Result:** System từ chối file không hợp lệ

---

#### TC-PRO-004: Cập nhật thông tin profile
**Priority:** M  
**Precondition:** Expert đã có profile đầy đủ

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Vào trang "Edit Profile" | Form edit hiển thị với dữ liệu hiện tại |
| 2 | Thay đổi hourly rate từ $50 → $75 | Field cập nhật |
| 3 | Thêm skill mới: "GPT-4 Integration" | Tag skill thêm vào |
| 4 | Nhấn "Save" | Thông báo "Profile updated successfully" |

**Expected Result:** Thông tin mới hiển thị trên public profile

---

### 2.2 Publish AI Services

---

#### TC-SVC-001: Tạo và publish AI service thành công
**Priority:** H  
**Precondition:** Expert đã có profile đầy đủ

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Vào "My Services" → "Create New Service" | Form tạo service hiển thị |
| 2 | Nhập title: "Custom AI Chatbot Development" | Field nhận input |
| 3 | Nhập description đầy đủ | Textarea nhận input |
| 4 | Đặt giá: $299 | Field giá nhận input |
| 5 | Chọn delivery time: "7 days" | Dropdown chọn được |
| 6 | Upload thumbnail image | Ảnh preview hiển thị |
| 7 | Nhấn "Publish" | Service được tạo thành công với trạng thái **PENDING_REVIEW** |
| 8 | Admin vào Admin Panel → Services và nhấn "Activate" | Service chuyển sang trạng thái **ACTIVE** và hiển thị trên marketplace |

**Expected Result:** Service xuất hiện trên marketplace với trạng thái Active (sau khi Admin duyệt)

> **Ghi chú (Actual Behavior):** Service mới được tạo ra ở trạng thái `PENDING_REVIEW`. Cần Admin kích hoạt mới xuất hiện trên marketplace.

---

#### TC-SVC-002: Tạo service thiếu thông tin bắt buộc
**Priority:** H  
**Precondition:** Expert đang tạo service mới

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Điền title nhưng bỏ trống description | Field description rỗng |
| 2 | Nhấn "Publish" | Hiển thị lỗi "Description is required" |

**Expected Result:** Validation ngăn publish service thiếu thông tin

---

#### TC-SVC-003: Tạm dừng (pause) service
**Priority:** M  
**Precondition:** Expert có service đang Active

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Vào "My Services" | Danh sách services hiển thị |
| 2 | Nhấn "Pause" trên service cần dừng | Dialog xác nhận hiển thị |
| 3 | Nhấn "Confirm" | Service status chuyển "Paused" |
| 4 | Kiểm tra marketplace | Service không còn hiển thị trên marketplace |

**Expected Result:** Service không nhận order mới khi bị pause

---

#### TC-SVC-004: Chỉnh sửa service đang active
**Priority:** M  
**Precondition:** Expert có service đang Active

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Vào "My Services" → Edit service | Form edit hiển thị |
| 2 | Thay đổi giá từ $299 → $399 | Field giá cập nhật |
| 3 | Nhấn "Save" | Thông báo "Service updated" |
| 4 | Kiểm tra trang marketplace | Service hiển thị giá mới $399 |

**Expected Result:** Thay đổi phản ánh ngay trên marketplace

---

### 2.3 Submit Proposals for Jobs

---

#### TC-PROP-001: Nộp proposal cho job thành công
**Priority:** H  
**Precondition:** Expert đã đăng nhập, có job mở phù hợp skills

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Tìm job phù hợp trên marketplace | Trang chi tiết job hiển thị |
| 2 | Nhấn "Submit Proposal" | Form proposal hiển thị |
| 3 | Nhập bid amount: $450 | Field nhận input |
| 4 | Nhập cover letter chi tiết | Textarea nhận input |
| 5 | Đề xuất timeline: "10 days" | Field timeline nhận input |
| 6 | Nhấn "Submit" | Thông báo "Proposal submitted successfully" |

**Expected Result:** Proposal xuất hiện trong danh sách proposals của job, Client nhận notification

---

#### TC-PROP-002: Không thể nộp proposal trùng lặp cho cùng job
**Priority:** H  
**Precondition:** Expert đã nộp proposal cho job X

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Truy cập lại trang job X | Trang job hiển thị |
| 2 | Kiểm tra nút Submit Proposal | Nút bị disabled hoặc hiển thị "Proposal Submitted" |
| 3 | Cố gắng submit lại qua API | Trả về lỗi "You already submitted a proposal for this job" |

**Expected Result:** Ngăn expert nộp proposal trùng lặp

---

#### TC-PROP-003: Nộp proposal với bid vượt quá budget của job
**Priority:** M  
**Precondition:** Job có budget $500

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Mở form proposal | Form hiển thị, có hiển thị budget của client |
| 2 | Nhập bid: $2000 (gấp 4 lần budget) | Field nhận input |
| 3 | Nhấn Submit | Cảnh báo "Your bid exceeds the client's budget. Proceed?" hoặc cho phép submit với warning |

**Expected Result:** System cảnh báo nhưng cho phép submit (expert có thể thương lượng)

---

#### TC-PROP-004: Rút lại proposal đã nộp
**Priority:** M  
**Precondition:** Expert đã nộp proposal, chưa được accept/reject

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Vào "My Proposals" | Danh sách proposals hiển thị |
| 2 | Tìm proposal cần rút | Proposal có trạng thái "Pending" |
| 3 | Nhấn "Withdraw" | Dialog xác nhận hiển thị |
| 4 | Confirm | Proposal bị xóa khỏi job |

**Expected Result:** Proposal không còn trong danh sách của job

---

### 2.4 Manage Projects & Deliverables

---

#### TC-DEL-001: Submit deliverable cho milestone
**Priority:** H  
**Precondition:** Expert đang active project có milestone pending

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Vào "My Projects" → project detail | Project detail hiển thị |
| 2 | Click vào milestone cần submit | Milestone detail hiển thị |
| 3 | Nhấn "Submit Deliverable" | Form submit hiển thị |
| 4 | Upload file deliverable | File được upload |
| 5 | Nhập mô tả/notes | Textarea nhận input |
| 6 | Nhấn "Submit" | Milestone status chuyển "Pending Review", Client nhận notification |

**Expected Result:** Client nhận thông báo và có thể review deliverable

---

#### TC-DEL-002: Cập nhật deliverable sau khi client yêu cầu revision
**Priority:** H  
**Precondition:** Client đã gửi revision request cho milestone

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Nhận notification "Revision Requested" | Notification hiển thị |
| 2 | Đọc feedback của client | Feedback hiển thị rõ ràng |
| 3 | Chỉnh sửa và upload deliverable mới | File mới được upload |
| 4 | Nhấn "Resubmit" | Milestone quay lại trạng thái "Pending Review" |

**Expected Result:** Client nhận thông báo về deliverable đã được cập nhật

---

### 2.5 Track Earnings & Withdraw Money

---

#### TC-EARN-001: Xem tổng quan thu nhập
**Priority:** H  
**Precondition:** Expert đã hoàn thành ít nhất 1 project

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Vào "Earnings" trên dashboard | Trang earnings hiển thị |
| 2 | Kiểm tra thông tin | Hiển thị: tổng thu nhập, pending, available to withdraw |
| 3 | Xem lịch sử earnings | Danh sách transactions với ngày, số tiền, project |

**Expected Result:** Thông tin tài chính hiển thị chính xác

---

#### TC-EARN-002: Rút tiền thành công
**Priority:** H  
**Precondition:** Expert có balance available >= $50 (minimum withdrawal), đã liên kết phương thức nhận tiền

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Nhấn "Withdraw" trên trang Earnings | Form withdrawal hiển thị |
| 2 | Nhập số tiền muốn rút: $200 | Field nhận input |
| 3 | Chọn phương thức: PayPal | Dropdown hiển thị account đã liên kết |
| 4 | Nhấn "Confirm Withdrawal" | Thông báo "Withdrawal request submitted" |
| 5 | Kiểm tra balance | Balance giảm đúng số tiền đã rút |

**Expected Result:** Withdrawal được xử lý, tiền chuyển đến tài khoản PayPal của expert

---

#### TC-EARN-003: Rút tiền vượt quá số dư available
**Priority:** H  
**Precondition:** Expert có balance available = $100

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Mở form withdrawal | Balance hiển thị $100 |
| 2 | Nhập số tiền: $500 | Field nhận input |
| 3 | Nhấn "Confirm" | Hiển thị lỗi "Insufficient balance" |

**Expected Result:** Withdrawal bị từ chối, balance không thay đổi

---

#### TC-EARN-004: Rút tiền dưới mức tối thiểu
**Priority:** M  
**Precondition:** Expert có balance available = $200

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Mở form withdrawal | Form hiển thị |
| 2 | Nhập số tiền: $10 (dưới minimum $50) | Field nhận input |
| 3 | Nhấn "Confirm" | Hiển thị lỗi "Minimum withdrawal amount is $50" |

**Expected Result:** Validation ngăn rút dưới minimum

---

## 3. AI MODULES

### 3.1 AI Job Assistant

---

#### TC-AI-JOB-001: AI gợi ý cải thiện job description
**Priority:** H  
**Precondition:** Client đang tạo job posting, đã nhập description ngắn/mơ hồ

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Nhập description: "I need an AI bot" | Field nhận input |
| 2 | Nhấn "Improve with AI" hoặc chờ AI gợi ý tự động | Indicator loading hiển thị |
| 3 | AI xử lý xong | Hiển thị description được cải thiện chi tiết hơn |
| 4 | Client có thể chấp nhận hoặc từ chối gợi ý | Nút "Accept" và "Dismiss" hiển thị |
| 5 | Nhấn "Accept" | Description được thay thế bằng gợi ý của AI |

**Expected Result:** Description AI gợi ý cụ thể, chuyên nghiệp hơn input gốc

---

#### TC-AI-JOB-002: AI gợi ý budget phù hợp
**Priority:** H  
**Precondition:** Client đã nhập title và description

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Điền title: "Machine Learning Model Training" | Field nhận input |
| 2 | Điền description đầy đủ | Textarea nhận input |
| 3 | Nhấn "Suggest Budget" | AI phân tích và gợi ý khoảng budget |
| 4 | Kiểm tra gợi ý | Hiển thị budget range dựa trên loại job (e.g., "$300 - $800") |

**Expected Result:** Budget gợi ý hợp lý với market rate cho loại job tương ứng

---

#### TC-AI-JOB-003: AI gợi ý skills cần thiết
**Priority:** H  
**Precondition:** Client đã nhập title và description cho job

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Điền job title: "NLP-based Document Classifier" | Field nhận input |
| 2 | Nhấn "Suggest Skills" | AI phân tích content |
| 3 | Kiểm tra kết quả | Hiển thị danh sách skills gợi ý: Python, NLP, scikit-learn, BERT, etc. |
| 4 | Client chọn skills phù hợp | Click để add skills từ gợi ý |

**Expected Result:** Skills gợi ý liên quan và có giá trị thực tế

---

#### TC-AI-JOB-004: AI Job Assistant hoạt động khi description quá dài
**Priority:** L  
**Precondition:** Client nhập description rất dài (>2000 ký tự)

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Nhập description >2000 ký tự | Textarea nhận input |
| 2 | Nhấn "Improve with AI" | AI xử lý |
| 3 | Quan sát kết quả | AI tóm tắt và cải thiện, không bị timeout |

**Expected Result:** AI xử lý được input dài mà không bị lỗi

---

### 3.2 AI Service Generator

---

#### TC-AI-SVC-001: AI tự động generate service description
**Priority:** H  
**Precondition:** Expert đang tạo service mới

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Nhập service title: "Computer Vision Object Detection" | Field nhận input |
| 2 | Nhấn "Generate Description with AI" | Loading indicator hiển thị |
| 3 | AI xử lý xong | Description chuyên nghiệp tự động điền vào textarea |
| 4 | Kiểm tra content | Description phù hợp với title, có bullet points về deliverables, process |

**Expected Result:** Description AI tạo ra hữu ích, có thể dùng ngay hoặc chỉnh sửa thêm

---

#### TC-AI-SVC-002: AI generate service từ title mơ hồ
**Priority:** M  
**Precondition:** Expert đang tạo service

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Nhập title mơ hồ: "AI stuff" | Field nhận input |
| 2 | Nhấn "Generate Description with AI" | AI cố gắng generate |
| 3 | Kiểm tra kết quả | AI generate được description cơ bản HOẶC thông báo "Please provide a more specific title" |

**Expected Result:** Graceful handling với input không rõ ràng

---

#### TC-AI-SVC-003: Expert có thể chỉnh sửa sau khi AI generate
**Priority:** M  
**Precondition:** AI đã generate description cho service

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | AI generate xong description | Description hiển thị trong textarea |
| 2 | Expert chỉnh sửa nội dung | Textarea cho phép edit tự do |
| 3 | Lưu service | Nội dung đã chỉnh sửa được lưu |

**Expected Result:** AI generate là điểm khởi đầu, expert có toàn quyền chỉnh sửa

---

### 3.3 AI Expert Recommendation

---

#### TC-AI-REC-001: AI recommend experts phù hợp cho job
**Priority:** H  
**Precondition:** Có job posting và có ít nhất 5 expert profiles trong hệ thống

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Client tạo job mới | Job được tạo |
| 2 | AI phân tích job skills và requirements | Indicator "Finding experts..." hiển thị |
| 3 | AI trả về kết quả | Danh sách top 3-5 experts được gợi ý |
| 4 | Kiểm tra matching | Experts được gợi ý có skills liên quan đến job |
| 5 | Xem lý do matching | Hiển thị "Match score: 92% - Skills: Python, ML" |

**Expected Result:** Recommendations liên quan, có score và lý do rõ ràng

---

#### TC-AI-REC-002: AI recommendation khi không có expert phù hợp
**Priority:** M  
**Precondition:** Job yêu cầu skill rất hiếm, ít expert có

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Tạo job với skill đặc biệt hiếm | Job được tạo |
| 2 | AI xử lý recommendation | AI analyze |
| 3 | Kiểm tra kết quả | Hiển thị "No exact matches found. Showing closest alternatives." hoặc top closest matches |

**Expected Result:** AI không trả về kết quả trống mà đề xuất alternatives

---

#### TC-AI-REC-003: Verify AI recommendation score accuracy
**Priority:** M  
**Precondition:** Có expert A có 5/5 required skills, expert B có 2/5 skills

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Tạo job với 5 required skills | Job được tạo |
| 2 | Chạy AI recommendation | AI trả về danh sách |
| 3 | So sánh vị trí Expert A và Expert B | Expert A có match score cao hơn Expert B |

**Expected Result:** AI ranking theo mức độ matching thực tế

---

## 4. ADMIN

### 4.1 Manage Users

---

#### TC-ADM-USER-001: Admin xem danh sách tất cả users
**Priority:** H  
**Precondition:** Đăng nhập với role Admin

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Vào Admin Panel → Users | Danh sách users hiển thị dạng bảng |
| 2 | Kiểm tra thông tin mỗi user | Hiển thị: ID, tên, email, role, ngày đăng ký, trạng thái |
| 3 | Tìm kiếm theo email | Filter hoạt động, hiển thị đúng kết quả |
| 4 | Filter theo role: Expert | Chỉ hiển thị users có role Expert |

**Expected Result:** Admin có thể xem và filter toàn bộ danh sách user

---

#### TC-ADM-USER-002: Admin vô hiệu hóa (ban) tài khoản user
**Priority:** H  
**Precondition:** Admin đã đăng nhập, có user vi phạm cần ban

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Tìm user cần ban trong danh sách | User hiển thị trong bảng |
| 2 | Nhấn "Ban User" | Dialog xác nhận với ô nhập lý do hiển thị |
| 3 | Nhập lý do: "Violates terms of service" | Textarea nhận input |
| 4 | Nhấn "Confirm Ban" | User status chuyển "Banned" |
| 5 | User bị ban thử đăng nhập | Thông báo "Account suspended" hiển thị |

**Expected Result:** User không thể đăng nhập, tài khoản bị đánh dấu Banned

---

#### TC-ADM-USER-003: Admin kích hoạt lại tài khoản đã bị ban
**Priority:** M  
**Precondition:** Tồn tại user với trạng thái Banned

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Tìm user bị ban trong Admin Panel | User hiển thị với status "Banned" |
| 2 | Nhấn "Unban User" | Dialog xác nhận hiển thị |
| 3 | Nhấn "Confirm" | User status chuyển "Active" |
| 4 | User thử đăng nhập | Đăng nhập thành công |

**Expected Result:** Tài khoản được khôi phục hoàn toàn

---

#### TC-ADM-USER-004: Admin xem chi tiết profile user
**Priority:** M  
**Precondition:** Admin đã đăng nhập

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Click vào tên user trong danh sách | Trang chi tiết user mở |
| 2 | Kiểm tra thông tin | Hiển thị: profile, projects, reviews, transaction history |
| 3 | Admin xem transaction history | Lịch sử giao dịch của user hiển thị |

**Expected Result:** Admin có view toàn diện về activity của user

---

### 4.2 Manage Jobs & Services

---

#### TC-ADM-JOB-001: Admin xem và duyệt job posting
**Priority:** H  
**Precondition:** Có job mới đang chờ duyệt (nếu có chế độ moderation)

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Vào Admin → Jobs | Danh sách jobs hiển thị |
| 2 | Filter "Pending Review" | Chỉ hiển thị jobs chờ duyệt |
| 3 | Click vào job | Chi tiết job hiển thị |
| 4 | Nhấn "Approve" | Job được publish lên marketplace |
| 5 | Nhấn "Reject" (với job khác) | Job bị reject, Client nhận thông báo |

**Expected Result:** Job được approve/reject đúng flow

---

#### TC-ADM-SVC-001: Admin xóa service vi phạm
**Priority:** H  
**Precondition:** Có service vi phạm chính sách

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Tìm service vi phạm trong Admin → Services | Service hiển thị |
| 2 | Nhấn "Remove Service" | Dialog xác nhận + nhập lý do hiển thị |
| 3 | Nhập lý do vi phạm | Textarea nhận input |
| 4 | Nhấn "Confirm Remove" | Service bị xóa khỏi marketplace |
| 5 | Expert nhận thông báo | Email/notification "Your service has been removed" |

**Expected Result:** Service không còn trên marketplace, expert được thông báo

---

### 4.3 Handle Disputes

---

#### TC-ADM-DIS-001: Admin xem danh sách disputes
**Priority:** H  
**Precondition:** Có ít nhất 1 dispute đang mở

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Vào Admin → Disputes | Danh sách disputes hiển thị |
| 2 | Kiểm tra thông tin | Hiển thị: ID, project, client, expert, ngày mở, status |
| 3 | Filter "Open" | Chỉ hiển thị disputes chưa giải quyết |
| 4 | Click vào dispute | Chi tiết dispute hiển thị với toàn bộ lịch sử |

**Expected Result:** Admin có đủ thông tin để xem xét dispute

---

#### TC-ADM-DIS-002: Admin giải quyết dispute - hoàn tiền cho client
**Priority:** H  
**Precondition:** Có dispute đang Open với escrow chưa release

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Mở chi tiết dispute | Thông tin dispute hiển thị |
| 2 | Xem xét bằng chứng từ cả 2 phía | Chat history, deliverables, comments hiển thị |
| 3 | Chọn resolution: "Refund Client" | Option hiển thị |
| 4 | Nhập ghi chú quyết định | Textarea nhận input |
| 5 | Nhấn "Apply Resolution" | Tiền escrow được hoàn về tài khoản Client |
| 6 | Kiểm tra notifications | Cả Client và Expert nhận thông báo kết quả |

**Expected Result:** Tiền được xử lý đúng theo quyết định của Admin, 2 bên đều được thông báo

---

#### TC-ADM-DIS-003: Admin giải quyết dispute - release payment cho expert
**Priority:** H  
**Precondition:** Có dispute đang Open, expert đã deliver đầy đủ

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Mở chi tiết dispute | Thông tin đầy đủ hiển thị |
| 2 | Review deliverables của expert | Files/links có thể download |
| 3 | Chọn resolution: "Release Payment to Expert" | Option hiển thị |
| 4 | Nhập lý do | Textarea nhận input |
| 5 | Nhấn "Apply" | Tiền escrow được chuyển cho expert |

**Expected Result:** Expert nhận tiền, dispute đóng lại

---

#### TC-ADM-DIS-004: Admin partial refund (hoàn tiền một phần)
**Priority:** M  
**Precondition:** Có dispute đang Open, cần giải quyết chia đôi

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Mở chi tiết dispute | Thông tin hiển thị |
| 2 | Chọn resolution: "Partial Refund" | Input số tiền hoàn hiển thị |
| 3 | Nhập: hoàn 60% cho client, 40% cho expert | Fields nhận input |
| 4 | Nhấn "Apply" | Tiền được chia theo tỷ lệ đã định |

**Expected Result:** Tiền được phân chia đúng tỷ lệ

---

### 4.4 Monitor Transactions & Analytics

---

#### TC-ADM-ANL-001: Xem tổng quan analytics dashboard
**Priority:** H  
**Precondition:** Đăng nhập với role Admin

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Vào Admin → Analytics Dashboard | Dashboard tải trong < 5 giây |
| 2 | Kiểm tra các metrics hiển thị | Hiển thị: tổng users, tổng revenue, active projects, số jobs/tháng |
| 3 | Kiểm tra biểu đồ | Revenue chart theo thời gian hiển thị |
| 4 | Lọc theo thời gian: Last 30 days | Data cập nhật theo bộ lọc |

**Expected Result:** Dashboard hiển thị metrics chính xác và realtime

---

#### TC-ADM-ANL-002: Xem lịch sử tất cả transactions
**Priority:** H  
**Precondition:** Admin đã đăng nhập

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Vào Admin → Transactions | Danh sách toàn bộ transactions hiển thị |
| 2 | Kiểm tra thông tin | Hiển thị: ID, loại (payment/refund/withdrawal), số tiền, ngày, users liên quan |
| 3 | Search theo Transaction ID | Kết quả đúng transaction hiển thị |
| 4 | Export to CSV | File CSV được download với đầy đủ data |

**Expected Result:** Admin có thể tra cứu và export toàn bộ lịch sử giao dịch

---

#### TC-ADM-ANL-003: Xem revenue report theo khoảng thời gian
**Priority:** M  
**Precondition:** Admin đã đăng nhập, có data transactions

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Vào Revenue Report | Trang report hiển thị |
| 2 | Chọn range: 01/01/2026 - 31/03/2026 | Date picker nhận input |
| 3 | Nhấn "Generate Report" | Report được tạo với data trong range |
| 4 | Kiểm tra tổng doanh thu | Số liệu khớp với tổng của individual transactions |

**Expected Result:** Report chính xác, số liệu có thể verify được

---

#### TC-ADM-ANL-004: Monitor active projects realtime
**Priority:** M  
**Precondition:** Admin đã đăng nhập

| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Vào Admin → Projects | Danh sách projects hiển thị |
| 2 | Filter "Active" | Chỉ hiển thị projects đang chạy |
| 3 | Kiểm tra projects quá hạn | Projects có deadline < today được highlight màu đỏ |
| 4 | Click vào project | Chi tiết project, milestone, communication hiển thị |

**Expected Result:** Admin có thể monitor và can thiệp khi cần

---

## PHỤ LỤC

### Môi trường Test

| Môi trường | URL | Mô tả |
|-----------|-----|--------|
| Development | dev.marketplace.com | Dev environment cho testing |
| Staging | staging.marketplace.com | Pre-production testing |
| Production | marketplace.com | Live environment |

### Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@test.com | Test@12345 |
| Client | client@test.com | Test@12345 |
| Expert | expert@test.com | Test@12345 |

### Định nghĩa mức Priority

| Priority | Mô tả |
|---------|--------|
| H (High) | Tính năng cốt lõi, block release nếu fail |
| M (Medium) | Quan trọng nhưng có workaround |
| L (Low) | Nice to have, có thể fix ở sprint sau |

---

*Tài liệu này được tạo bởi QA Team - Phiên bản 1.0 - 30/05/2026*
