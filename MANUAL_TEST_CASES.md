# MANUAL TEST CASES — AIMarket (AITasker)

**Ứng dụng:** AI Freelance Marketplace  
**Frontend:** http://localhost:3000  
**Swagger API:** http://localhost:8080/swagger-ui.html  
**Phiên bản:** 1.0  
**Ngày tạo:** 2026-06-25

---

## MỤC LỤC

| # | Module | Số TC |
|---|--------|-------|
| 1 | [Xác thực & Phân quyền](#1-xác-thực--phân-quyền) | 9 |
| 2 | [Quản lý Hồ sơ Người dùng](#2-quản-lý-hồ-sơ-người-dùng) | 5 |
| 3 | [AI Modules Integration](#3-ai-modules-integration) | 3 |
| 4 | [Quản lý Dự án / Jobs](#4-quản-lý-dự-án--jobs) | 5 |
| 5 | [Quản lý Dịch vụ / Services](#5-quản-lý-dịch-vụ--services) | 5 |
| 6 | [Báo giá / Proposals](#6-báo-giá--proposals) | 4 |
| 7 | [Hợp đồng & Cột mốc](#7-hợp-đồng--cột-mốc) | 5 |
| 8 | [Ví & Thanh toán](#8-ví--thanh-toán) | 4 |
| 9 | [Khiếu nại / Disputes](#9-khiếu-nại--disputes) | 3 |
| 10 | [Chat System](#10-chat-system) | 3 |
| 11 | [Đánh giá & Nhận xét](#11-đánh-giá--nhận-xét) | 3 |
| 12 | [Thông báo / Notifications](#12-thông-báo--notifications) | 3 |
| 13 | [Admin Dashboard](#13-admin-dashboard) | 4 |

---

## LEGEND

| Ký hiệu | Ý nghĩa |
|---------|---------|
| 🔴 H | Priority High |
| 🟡 M | Priority Medium |
| 🟢 L | Priority Low |
| ✅ PASS | Test đạt |
| ❌ FAIL | Test thất bại |
| ⬜ | Chưa test |

**Tài khoản test cần chuẩn bị trước:**

| Vai trò | Email | Password |
|---------|-------|----------|
| CLIENT | client@test.com | Test@123456 |
| EXPERT | expert@test.com | Test@123456 |
| ADMIN | admin@test.com | Admin@123456 |

---

## 1. Xác thực & Phân quyền

### TC-AUTH-001 — Đăng ký tài khoản CLIENT 🔴 H

**Điều kiện tiên quyết:** Chưa đăng nhập, email chưa tồn tại

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | Mở http://localhost:3000, click **Sign Up / Register** | Hiển thị form đăng ký | | ⬜ |
| 2 | Nhập Email: `client@test.com`, Password: `Test@123456`, chọn Role: **CLIENT** | Form hợp lệ, không có lỗi đỏ | | ⬜ |
| 3 | Click **Submit** | Đăng ký thành công, chuyển đến `/dashboard/client` hoặc hiện thông báo thành công | | ⬜ |

---

### TC-AUTH-002 — Đăng ký tài khoản EXPERT 🔴 H

**Điều kiện tiên quyết:** Chưa đăng nhập

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | Mở trang Register | Form hiển thị | | ⬜ |
| 2 | Nhập Email: `expert@test.com`, Password: `Test@123456`, Role: **EXPERT** | Form hợp lệ | | ⬜ |
| 3 | Click **Submit** | Đăng ký thành công, chuyển đến `/dashboard/expert` | | ⬜ |

---

### TC-AUTH-003 — Validation khi đăng ký (Negative) 🔴 H

**Điều kiện tiên quyết:** Đã có tài khoản `client@test.com`

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | Đăng ký lại với email `client@test.com` đã tồn tại | Hiện lỗi: "Email already exists" hoặc tương đương | | ⬜ |
| 2 | Nhập email sai định dạng: `notanemail` | Hiện lỗi: "Invalid email format" | | ⬜ |
| 3 | Để trống trường Password, click Submit | Hiện lỗi "Password is required" | | ⬜ |
| 4 | Nhập password quá ngắn: `123` | Hiện lỗi về độ dài/độ phức tạp password | | ⬜ |

---

### TC-AUTH-004 — Đăng nhập hợp lệ & Điều hướng 🔴 H

**Điều kiện tiên quyết:** Đã có tài khoản CLIENT và EXPERT

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | Login với `client@test.com` / `Test@123456` | Chuyển hướng về `/dashboard/client` | | ⬜ |
| 2 | Đăng xuất, login với `expert@test.com` / `Test@123456` | Chuyển hướng về `/dashboard/expert` | | ⬜ |
| 3 | Khi đang đăng nhập, thử vào lại `/login` | Tự redirect về dashboard — không hiện lại form login | | ⬜ |

---

### TC-AUTH-005 — Đăng nhập thất bại (Negative) 🔴 H

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | Login với email đúng nhưng sai password | Hiện lỗi "Invalid credentials" hoặc tương đương | | ⬜ |
| 2 | Login với email không tồn tại | Hiện lỗi chung (không tiết lộ email có tồn tại hay không) | | ⬜ |
| 3 | Bỏ trống cả 2 trường, click Login | Hiện validation error | | ⬜ |

---

### TC-AUTH-006 — Middleware RBAC (Phân quyền theo vai trò) 🔴 H

**Điều kiện tiên quyết:** Đã login là CLIENT

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | Không đăng nhập, truy cập `http://localhost:3000/dashboard/client` | Bị redirect về `/login` | | ⬜ |
| 2 | Login CLIENT, điều hướng đến `http://localhost:3000/dashboard/expert` | Bị chặn, redirect về 403 hoặc dashboard CLIENT | | ⬜ |
| 3 | Login CLIENT, gọi API `POST /api/v1/services` (chỉ EXPERT mới tạo được) | HTTP 403 Forbidden | | ⬜ |

---

### TC-AUTH-007 — Đăng xuất (Logout) 🔴 H

**Điều kiện tiên quyết:** Đang đăng nhập

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | Click nút **Logout** (sidebar/header/user menu) | Redirect về trang `/login` | | ⬜ |
| 2 | Sau khi logout, nhấn Back trên trình duyệt | Không thể vào lại dashboard, bị redirect về login | | ⬜ |
| 3 | Sau khi logout, thử truy cập API với token cũ (qua DevTools hoặc Swagger) | HTTP 401 — token đã bị blacklist | | ⬜ |

---

### TC-AUTH-008 — Quên mật khẩu (Forgot Password) 🟡 M

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | Click "Forgot Password" trên trang Login | Hiển thị form nhập email | | ⬜ |
| 2 | Nhập email `client@test.com`, click Submit | Hiện thông báo: "Reset link has been sent" | | ⬜ |
| 3 | Nhập email không tồn tại `ghost@x.com` | Hiện **cùng thông báo** (không lộ info user tồn tại hay không) | | ⬜ |
| 4 | Xem log backend: `docker logs aimarket-backend` | Tìm thấy reset token trong log (do mail chưa cấu hình) | | ⬜ |

---

### TC-AUTH-009 — Đặt lại mật khẩu (Reset Password) 🟡 M

**Điều kiện tiên quyết:** Đã có reset token từ TC-AUTH-008

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | Truy cập link reset (hoặc gọi API `POST /auth/reset-password`) với token hợp lệ + newPassword | HTTP 200 — "Password reset successfully" | | ⬜ |
| 2 | Login với mật khẩu **mới** | Đăng nhập thành công | | ⬜ |
| 3 | Login với mật khẩu **cũ** | HTTP 401 — không thể login | | ⬜ |
| 4 | Dùng lại cùng reset token lần 2 | Lỗi: "Token invalid or expired" (one-time use) | | ⬜ |

---

## 2. Quản lý Hồ sơ Người dùng

### TC-PROF-001 — Xem Profile 🟡 M

**Điều kiện tiên quyết:** Đã đăng nhập với bất kỳ role nào

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | Click vào avatar / tên người dùng → chọn **My Profile** | Trang profile hiển thị đầy đủ: Avatar, tên, bio, email, ngày tạo | | ⬜ |
| 2 | Truy cập profile công khai của Expert (từ Job Detail hoặc URL) | Hiển thị thông tin Expert, danh sách skill, portfolio và rating | | ⬜ |

---

### TC-PROF-002 — Cập nhật thông tin cơ bản 🔴 H

**Điều kiện tiên quyết:** Đang đăng nhập

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | Click **Edit Profile** | Form chỉnh sửa hiện ra với dữ liệu hiện tại đã điền sẵn | | ⬜ |
| 2 | Sửa **Full Name**: `"New Name"`, **Bio**: `"AI expert with 3 years..."`, **Timezone**: `"Asia/Ho_Chi_Minh"` | Nhập được bình thường | | ⬜ |
| 3 | Với role EXPERT: sửa **Hourly Rate** = `75` | Field hiển thị và nhập được (chỉ Expert thấy) | | ⬜ |
| 4 | Click **Save Changes** | Toast "Profile updated successfully!", thông tin cập nhật ngay trên UI | | ⬜ |
| 5 | Reload trang | Dữ liệu mới vẫn được lưu (không bị mất) | | ⬜ |

---

### TC-PROF-003 — Quản lý Skills (Expert) 🟡 M

**Điều kiện tiên quyết:** Đang đăng nhập với role EXPERT

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | Vào Edit Profile, tìm phần **My AI Skills** | Hiển thị SkillSelector component | | ⬜ |
| 2 | Thêm skill: `NLP`, `Computer Vision` | Skill được chọn, hiển thị dưới dạng tag | | ⬜ |
| 3 | Xóa một skill đã chọn | Skill biến mất khỏi danh sách | | ⬜ |
| 4 | Save Changes, xem lại Profile | Danh sách skill cập nhật chính xác | | ⬜ |

---

### TC-PROF-004 — Quản lý Portfolio (Expert) 🔴 H

**Điều kiện tiên quyết:** Đang đăng nhập với role EXPERT

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | Vào Profile, click **Add Project** | Modal thêm portfolio mở ra | | ⬜ |
| 2 | Nhập: Title, Description, Demo URL, chọn Skills, Upload ảnh | Form nhận đầy đủ | | ⬜ |
| 3 | Click Save | Portfolio item xuất hiện trong lưới dự án | | ⬜ |
| 4 | Hover vào item, click icon Edit | Modal mở với dữ liệu cũ đã điền sẵn | | ⬜ |
| 5 | Hover vào item, click icon Delete, xác nhận | Item bị xóa khỏi danh sách | | ⬜ |
| 6 | Dùng nút ↑↓ để sắp xếp thứ tự portfolio | Thứ tự thay đổi, lưu lại sau reload | | ⬜ |

---

### TC-PROF-005 — Upload Avatar 🟢 L

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | Vào Edit Profile, hover vào avatar, click icon Camera | File picker mở ra | | ⬜ |
| 2 | Chọn file ảnh JPG/PNG | Preview ảnh mới hiện ngay | | ⬜ |
| 3 | Save Changes | Avatar mới lưu thành công | | ⬜ |

---

## 3. AI Modules Integration

### TC-AI-001 — AI Enhance Job Posting 🔴 H

**Điều kiện tiên quyết:** Đang đăng nhập với role CLIENT, đang trên trang Create Job

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | Nhập Title: `"Build AI Chatbot"`, Description: `"I need a chatbot for customer support"` | Dữ liệu đã điền | | ⬜ |
| 2 | Click nút **✨ Enhance with AI** | Loading spinner xuất hiện | | ⬜ |
| 3 | Chờ kết quả AI | Trường Description được tự động điền với nội dung JD chuyên nghiệp hơn | | ⬜ |

---

### TC-AI-002 — AI Service Generator 🔴 H

**Điều kiện tiên quyết:** Đang đăng nhập với role EXPERT, đang trên trang Create Service

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | Nhập Title: `"NLP Text Analysis"`, Skills: `"NLP, Python, BERT"` | Dữ liệu đã điền | | ⬜ |
| 2 | Click **Generate with AI** | Loading xuất hiện | | ⬜ |
| 3 | Chờ kết quả AI | Description được fill tự động với mô tả dịch vụ hấp dẫn, kèm Highlights và What You Get | | ⬜ |

---

### TC-AI-003 — AI Expert Recommendation 🔴 H

**Điều kiện tiên quyết:** Đã có Job OPEN, đã có ít nhất 1 EXPERT có skills

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | CLIENT vào trang chi tiết Job (Job Detail) | Trang hiển thị đầy đủ thông tin Job | | ⬜ |
| 2 | Tìm section **AI Recommended Experts** | Hiển thị danh sách các Expert phù hợp kèm Match Score | | ⬜ |
| 3 | Kiểm tra Expert có skills trùng với Job được xếp cao hơn | Expert phù hợp nhất xuất hiện đầu tiên | | ⬜ |

---

## 4. Quản lý Dự án / Jobs

### TC-JOB-001 — Đăng dự án mới 🔴 H

**Điều kiện tiên quyết:** Đang đăng nhập với role CLIENT

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | Vào **Post a Job** | Form đăng job hiển thị | | ⬜ |
| 2 | Nhập Title: `"Build NLP Pipeline"`, Description, Budget Min: `500`, Budget Max: `1000`, Deadline, chọn Skills | Form hợp lệ | | ⬜ |
| 3 | Click **Post Job** | Job được lưu, chuyển về My Jobs hoặc trang chi tiết Job mới | | ⬜ |
| 4 | Xem lại My Jobs | Job vừa tạo xuất hiện với status OPEN | | ⬜ |

---

### TC-JOB-002 — Duyệt Jobs (Browse) 🟡 M

**Điều kiện tiên quyết:** Đang đăng nhập với role EXPERT

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | Vào trang **Browse Jobs** | Hiển thị danh sách Jobs đang OPEN | | ⬜ |
| 2 | Dùng thanh tìm kiếm: gõ `"NLP"` | Lọc kết quả theo keyword | | ⬜ |
| 3 | Click vào 1 Job | Trang chi tiết Job hiển thị đầy đủ (title, desc, budget, skills, deadline) | | ⬜ |

---

### TC-JOB-003 — Cập nhật & Xóa Job 🟡 M

**Điều kiện tiên quyết:** CLIENT có 1 Job ở trạng thái OPEN chưa có Contract

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | Vào **My Jobs**, click **Edit** trên job | Form Edit hiển thị với data cũ | | ⬜ |
| 2 | Sửa Budget Max, click Save | Thay đổi được lưu | | ⬜ |
| 3 | Click **Delete** trên 1 job chưa có contract | Job bị xóa khỏi danh sách | | ⬜ |

---

### TC-JOB-004 — Validation khi tạo Job 🟡 M

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | Submit form trống (thiếu title) | Hiện lỗi validate "Title is required" | | ⬜ |
| 2 | Nhập Budget Min > Budget Max | Hiện lỗi "Min budget cannot exceed max budget" | | ⬜ |

---

### TC-JOB-005 — Expert không thể tạo Job 🟡 M

**Điều kiện tiên quyết:** Đang đăng nhập với role EXPERT

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | Gọi API `POST /api/v1/jobs` với Expert token | HTTP 403 Forbidden | | ⬜ |

---

## 5. Quản lý Dịch vụ / Services

### TC-SVC-001 — Tạo dịch vụ mới 🔴 H

**Điều kiện tiên quyết:** Đang đăng nhập với role EXPERT

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | Vào **My Services → Create Service** | Form tạo service hiển thị | | ⬜ |
| 2 | Nhập Title: `"AI Chatbot Development"`, Description, Price: `299`, Delivery Days: `7` | Form hợp lệ | | ⬜ |
| 3 | Click **Create** | Service được tạo ở trạng thái DRAFT/PENDING | | ⬜ |

---

### TC-SVC-002 — Kích hoạt / Tạm ngưng Service 🔴 H

**Điều kiện tiên quyết:** Đã có ít nhất 1 Service

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | Click **Activate** trên service DRAFT | Service chuyển thành ACTIVE, xuất hiện trên Marketplace | | ⬜ |
| 2 | Vào Marketplace, xác nhận service có hiển thị | Service xuất hiện trong danh sách public | | ⬜ |
| 3 | Click **Deactivate** | Service biến khỏi Marketplace, status INACTIVE | | ⬜ |

---

### TC-SVC-003 — Marketplace: Browse Services 🟡 M

**Điều kiện tiên quyết:** Có ít nhất 1 Service ACTIVE

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | Vào trang **Marketplace** | Danh sách services ACTIVE hiển thị | | ⬜ |
| 2 | Click vào 1 service | Trang chi tiết service: tên, mô tả, giá, delivery time, thông tin Expert | | ⬜ |

---

### TC-SVC-004 — Cập nhật & Xóa Service 🟡 M

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | My Services → Edit service | Form edit hiển thị data cũ | | ⬜ |
| 2 | Sửa Price, click Save | Thay đổi được lưu | | ⬜ |
| 3 | Delete service | Service bị xóa | | ⬜ |

---

### TC-SVC-005 — Client mua Service trực tiếp 🔴 H

**Điều kiện tiên quyết:** CLIENT đã nạp tiền, có Service ACTIVE

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | CLIENT vào trang chi tiết Service, click **Order Now** | Xác nhận mua hàng | | ⬜ |
| 2 | Xác nhận đặt hàng | Contract được tạo tự động, balance CLIENT giảm | | ⬜ |
| 3 | Vào **My Contracts** | Contract mới xuất hiện với status phù hợp | | ⬜ |

---

## 6. Báo giá / Proposals

### TC-PROP-001 — Expert nộp Proposal 🔴 H

**Điều kiện tiên quyết:** EXPERT đang xem Job Detail, Job ở trạng thái OPEN

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | Click **Submit Proposal** | Form proposal hiển thị | | ⬜ |
| 2 | Nhập Cover Letter, Bid Amount: `700`, Timeline: `14 days` | Form hợp lệ | | ⬜ |
| 3 | Click **Submit** | Proposal gửi thành công, nút bị disable (không submit lần 2) | | ⬜ |
| 4 | CLIENT nhận notification "New proposal received" | Notification xuất hiện trên icon chuông | | ⬜ |

---

### TC-PROP-002 — CLIENT xem danh sách Proposals 🔴 H

**Điều kiện tiên quyết:** Job có ít nhất 1 Proposal

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | CLIENT vào My Jobs → chọn Job → Proposals tab | Danh sách proposal hiển thị | | ⬜ |
| 2 | Xem chi tiết 1 proposal | Cover letter, bid amount, timeline, thông tin Expert | | ⬜ |

---

### TC-PROP-003 — CLIENT Accept Proposal → sinh Contract 🔴 H

**Điều kiện tiên quyết:** CLIENT có đủ balance, Job có Proposal

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | CLIENT click **Accept** trên 1 Proposal | Xác nhận dialog hiện ra | | ⬜ |
| 2 | Xác nhận | Proposal chuyển sang ACCEPTED, **Contract tự động được tạo** | | ⬜ |
| 3 | Kiểm tra My Contracts | Contract mới xuất hiện, liên kết đúng Job và Expert | | ⬜ |
| 4 | EXPERT nhận notification | EXPERT nhận thông báo proposal được chấp nhận | | ⬜ |

---

### TC-PROP-004 — CLIENT Reject Proposal 🟡 M

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | CLIENT click **Reject** trên Proposal | Proposal chuyển sang REJECTED | | ⬜ |
| 2 | Proposal không thể Accept sau khi đã Reject | Nút Accept bị disable / không hiển thị | | ⬜ |

---

## 7. Hợp đồng & Cột mốc

### TC-CONT-001 — Xem chi tiết Contract 🟡 M

**Điều kiện tiên quyết:** Đã có Contract giữa CLIENT và EXPERT

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | CLIENT vào **My Contracts**, click vào Contract | Hiển thị: thông tin 2 bên, tổng giá trị, Escrow status, danh sách Milestone | | ⬜ |
| 2 | EXPERT vào **My Contracts** | Cùng Contract hiển thị cho EXPERT | | ⬜ |

---

### TC-CONT-002 — Expert nộp sản phẩm (Submit Work) 🔴 H

**Điều kiện tiên quyết:** Contract ACTIVE, Milestone ở PENDING

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | EXPERT vào Contract Detail, tìm Milestone cần nộp | Milestone hiển thị với nút **Submit Work** | | ⬜ |
| 2 | Nhập deliverable URL / link báo cáo, click Submit | Milestone chuyển sang `PENDING_REVIEW` | | ⬜ |
| 3 | CLIENT nhận notification | Thông báo "Expert đã nộp sản phẩm Milestone X" | | ⬜ |

---

### TC-CONT-003 — CLIENT Approve Milestone → giải phóng Escrow 🔴 H

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | CLIENT click **Approve** trên Milestone đang `PENDING_REVIEW` | Xác nhận dialog hiện | | ⬜ |
| 2 | Xác nhận Approve | Milestone → `COMPLETED`, tiền Escrow tự động chuyển vào ví EXPERT | | ⬜ |
| 3 | Kiểm tra ví EXPERT | Balance EXPERT tăng đúng số tiền Milestone | | ⬜ |
| 4 | Kiểm tra Transaction History | Giao dịch `ESCROW_RELEASE` xuất hiện | | ⬜ |

---

### TC-CONT-004 — CLIENT Reject Milestone 🟡 M

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | CLIENT click **Reject** trên Milestone `PENDING_REVIEW` | Milestone quay về trạng thái cho phép EXPERT nộp lại | | ⬜ |
| 2 | Tiền Escrow không bị giải phóng | Balance EXPERT không thay đổi | | ⬜ |
| 3 | EXPERT nhận thông báo | "Milestone bị từ chối, cần làm lại" | | ⬜ |

---

### TC-CONT-005 — Luồng Escrow: FUNDED → LOCKED → RELEASED 🔴 H

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | CLIENT Fund contract (nạp tiền vào Escrow) | Escrow status `FUNDED`, lockedAmount tăng, balance CLIENT giảm | | ⬜ |
| 2 | Trong quá trình thực hiện | Tiền ở trạng thái `LOCKED` — không ai rút được | | ⬜ |
| 3 | Approve Milestone | Tiền chuyển từ `LOCKED` sang ví EXPERT (`RELEASED`) | | ⬜ |

---

## 8. Ví & Thanh toán

### TC-PAY-001 — Nạp tiền (Deposit) 🔴 H

**Điều kiện tiên quyết:** Đang đăng nhập CLIENT hoặc EXPERT

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | Vào **Wallet → Deposit** | Form nạp tiền hiển thị | | ⬜ |
| 2 | Nhập số tiền `500`, click Deposit (dùng Mock hoặc Stripe test card) | Giao dịch xử lý | | ⬜ |
| 3 | Sau khi thành công | Balance ví tăng `+500`, lịch sử giao dịch xuất hiện `DEPOSIT` | | ⬜ |

---

### TC-PAY-002 — Xem Lịch sử giao dịch 🟡 M

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | Vào **Wallet → Transactions** | Danh sách giao dịch hiển thị (DEPOSIT, ESCROW_LOCK, RELEASE, REFUND...) | | ⬜ |
| 2 | Kiểm tra các loại giao dịch có nhãn / màu sắc phân biệt | Dễ đọc, có icon hoặc màu cho từng loại | | ⬜ |

---

### TC-PAY-003 — Rút tiền (Withdraw) 🔴 H

**Điều kiện tiên quyết:** EXPERT có balance > 0

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | EXPERT vào Wallet → **Withdraw** | Form rút tiền hiển thị | | ⬜ |
| 2 | Nhập số tiền muốn rút (nhỏ hơn balance hiện tại) | Form hợp lệ | | ⬜ |
| 3 | Submit | Balance giảm, lệnh rút xuất hiện ở trạng thái PENDING | | ⬜ |

---

### TC-PAY-004 — Admin duyệt lệnh rút 🔴 H

**Điều kiện tiên quyết:** Có lệnh Withdraw PENDING từ TC-PAY-003

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | ADMIN vào **Withdrawals Management** | Danh sách lệnh rút PENDING | | ⬜ |
| 2 | Click **Approve** | Lệnh rút chuyển sang COMPLETED | | ⬜ |
| 3 | Click **Reject** trên lệnh rút khác | Lệnh rút bị hủy, balance Expert được hoàn lại | | ⬜ |

---

## 9. Khiếu nại / Disputes

### TC-DISP-001 — Mở Dispute 🔴 H

**Điều kiện tiên quyết:** Đang có Contract ACTIVE

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | CLIENT (hoặc EXPERT) vào Contract Detail, click **Open Dispute** | Form khiếu nại hiển thị | | ⬜ |
| 2 | Nhập lý do khiếu nại, Submit | Dispute được mở, Escrow **bị đóng băng** ngay lập tức | | ⬜ |
| 3 | ADMIN nhận thông báo | Notification xuất hiện trong admin panel | | ⬜ |

---

### TC-DISP-002 — Admin giải quyết Dispute: Refund cho CLIENT 🔴 H

**Điều kiện tiên quyết:** Dispute đang OPEN

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | ADMIN vào Disputes, xem chi tiết dispute | Thông tin 2 bên, lý do khiếu nại | | ⬜ |
| 2 | Admin chọn **Resolve: Refund to Client** | Tiền Escrow chuyển về ví CLIENT, dispute `RESOLVED` | | ⬜ |

---

### TC-DISP-003 — Admin giải quyết Dispute: Payout cho EXPERT 🔴 H

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | Admin chọn **Resolve: Release to Expert** trên dispute khác | Tiền Escrow chuyển vào ví EXPERT, dispute `RESOLVED` | | ⬜ |

---

## 10. Chat System

### TC-CHAT-001 — Chat real-time 🟡 M

**Điều kiện tiên quyết:** Có Contract giữa CLIENT và EXPERT

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | CLIENT vào Contract → tab **Chat** | Khung chat mở ra | | ⬜ |
| 2 | CLIENT gửi tin nhắn: `"Hello, can we start?"` | Tin nhắn xuất hiện ngay phía CLIENT | | ⬜ |
| 3 | Mở trình duyệt thứ 2, login EXPERT, vào cùng Contract | Tin nhắn của CLIENT hiển thị cho EXPERT **real-time** (không cần reload) | | ⬜ |

---

### TC-CHAT-002 — Lịch sử chat 🟢 L

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | Reload trang chat | Lịch sử tin nhắn vẫn còn đầy đủ | | ⬜ |
| 2 | Scroll lên trên với nhiều tin nhắn | Phân trang / lazy load hoạt động | | ⬜ |

---

### TC-CHAT-003 — Unread Count 🟡 M

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | EXPERT gửi tin nhắn khi CLIENT không ở tab chat | Badge số đỏ xuất hiện trên Contract hoặc icon chat | | ⬜ |
| 2 | CLIENT mở chat | Unread count về 0 | | ⬜ |

---

## 11. Đánh giá & Nhận xét

### TC-REV-001 — Client viết Review sau hoàn thành Contract 🟡 M

**Điều kiện tiên quyết:** Contract đã hoàn thành tất cả Milestone

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | CLIENT vào Contract hoàn thành, tìm nút **Write a Review** | Nút hiển thị (chỉ hiện khi contract completed) | | ⬜ |
| 2 | Chọn rating: 5 sao, nhập comment: `"Excellent work!"` | Form hợp lệ | | ⬜ |
| 3 | Submit | Review lưu thành công | | ⬜ |

---

### TC-REV-002 — Review hiển thị trên Profile Expert 🟡 M

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | Vào Profile public của EXPERT | Tab/section Reviews hiển thị review vừa gửi | | ⬜ |
| 2 | Kiểm tra Rating trung bình | Điểm trung bình cập nhật đúng (ví dụ: 5.0 ⭐) | | ⬜ |

---

### TC-REV-003 — Không review 2 lần 🟢 L

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | CLIENT cố gắng submit review lần 2 cùng contract | Nút Write Review biến mất hoặc API trả lỗi 400 | | ⬜ |

---

## 12. Thông báo / Notifications

### TC-NOTI-001 — Nhận thông báo tự động 🟡 M

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | EXPERT nộp Proposal cho Job của CLIENT | CLIENT thấy badge đỏ trên icon chuông 🔔 | | ⬜ |
| 2 | CLIENT Approve Milestone | EXPERT nhận thông báo "Milestone approved & payment released" | | ⬜ |

---

### TC-NOTI-002 — Đánh dấu đã đọc 🟡 M

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | Click vào 1 thông báo chưa đọc | Thông báo được đánh dấu đã đọc, badge giảm đi 1 | | ⬜ |
| 2 | Click **Mark all as read** | Tất cả thông báo đã đọc, badge về 0 | | ⬜ |

---

### TC-NOTI-003 — Deposit/Withdraw notification 🟢 L

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | Nạp tiền thành công | Nhận thông báo "Deposit of $X successful" | | ⬜ |
| 2 | Admin duyệt rút tiền | EXPERT nhận thông báo "Withdrawal approved" | | ⬜ |

---

## 13. Admin Dashboard

### TC-ADM-001 — Quản lý Users 🔴 H

**Điều kiện tiên quyết:** Đang đăng nhập với role ADMIN

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | Vào **Admin → Users** | Danh sách tất cả users hiển thị với role, status | | ⬜ |
| 2 | Click **Ban** một User | User status chuyển sang BANNED | | ⬜ |
| 3 | User bị ban cố đăng nhập | HTTP 403 / thông báo tài khoản bị khóa | | ⬜ |
| 4 | Admin **Unban** user đó | User có thể đăng nhập lại bình thường | | ⬜ |

---

### TC-ADM-002 — Quản lý Jobs & Services 🟡 M

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | Vào **Admin → Jobs Moderation** | Danh sách tất cả Jobs trên hệ thống | | ⬜ |
| 2 | Admin xóa / ẩn 1 Job vi phạm | Job biến khỏi Browse Jobs của EXPERT | | ⬜ |
| 3 | Vào **Admin → Services Moderation** | Danh sách Services, có thể xóa | | ⬜ |

---

### TC-ADM-003 — Giám sát Transactions 🟡 M

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | Vào **Admin → Transactions** | Danh sách tất cả giao dịch hệ thống | | ⬜ |
| 2 | Xem **Admin Dashboard Analytics** | Hiển thị biểu đồ: tổng Escrow, tỷ lệ thành công, conversion rate | | ⬜ |

---

### TC-ADM-004 — Non-admin không vào được Admin Panel 🔴 H

| Bước | Hành động | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|------|-----------|------------------|-----------------|------------|
| 1 | Login CLIENT, truy cập `http://localhost:3000/admin/dashboard` | Bị redirect hoặc hiện trang 403 | | ⬜ |
| 2 | Login EXPERT, gọi API `GET /api/v1/admin/users` | HTTP 403 Forbidden | | ⬜ |

---

## GHI CHÚ KHI TEST

> **Swagger UI** → http://localhost:8080/swagger-ui.html  
> **Adminer DB** → http://localhost:8081 (server: `mysql`, user: `root`, password: xem `.env`)

**Lấy reset token từ log:**
```bash
docker logs aimarket-backend 2>&1 | grep -i "reset"
```

**Kiểm tra Redis blacklist:**
```bash
docker exec -it aimarket-redis redis-cli
KEYS *blacklist*
KEYS *reset*
```

**Mock deposit (dev):**
```bash
# Gọi API trực tiếp qua Swagger: POST /api/v1/wallet/mock-deposit
# Body: { "amount": 500 }
```
