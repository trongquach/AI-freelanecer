# TEST CASES - AI MARKETPLACE PLATFORM (AITasker)

**Dự án:** AI Services Marketplace (AITasker)
**Phiên bản:** 2.0 (Cập nhật đồng bộ theo SYSTEM_FEATURES.md)
**Người tạo:** QA Team

---

## MỤC LỤC

1. [Xác thực & Phân quyền](#1-xác-thực--phân-quyền-authentication--authorization)
2. [Quản lý Hồ sơ Người dùng](#2-quản-lý-hồ-sơ-người-dùng-user-profile)
3. [Trợ lý Trí tuệ Nhân tạo](#3-trợ-lý-trí-tuệ-nhân-tạo-ai-modules-integration)
4. [Quản lý Dự án/Công việc](#4-quản-lý-dự-áncông-việc-jobs-management---client-side)
5. [Quản lý Dịch vụ](#5-quản-lý-dịch-vụ-services--gigs---expert-side)
6. [Chào giá & Đấu thầu](#6-chào-giá--đấu-thầu-proposals)
7. [Quản lý Hợp đồng & Cột mốc](#7-quản-lý-hợp-đồng--cột-mốc-contracts--milestones)
8. [Ví điện tử & Thanh toán](#8-ví-điện-tử--thanh-toán-wallet--payments)
9. [Hệ thống Khiếu nại](#9-hệ-thống-khiếu-nại-disputes)
10. [Trò chuyện](#10-trò-chuyện-chat-system)
11. [Đánh giá & Nhận xét](#11-đánh-giá--nhận-xét-reviews--ratings)
12. [Thông báo](#12-thông-báo-notifications)
13. [Quản trị Hệ thống](#13-quản-trị-hệ-thống-admin-dashboard)
14. [Mô hình Dữ liệu Cốt lõi](#14-mô-hình-dữ-liệu-cốt-lõi-core-data-entities)

---

## LEGEND
| Ký hiệu | Ý nghĩa |
|---------|---------|
| TC | Test Case |
| P | Priority: High (H) / Medium (M) / Low (L) |

---

## 1. Xác thực & Phân quyền (Authentication & Authorization)

#### TC-AUTH-001: Đăng ký tài khoản Client / Expert
**Priority:** H
| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Điền thông tin đăng ký và chọn role (CLIENT hoặc EXPERT) | Form validate đầy đủ |
| 2 | Nhấn Submit | Tài khoản được tạo thành công, tự động cấp role tương ứng |

#### TC-AUTH-002: Đăng nhập và điều hướng
**Priority:** H
| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Đăng nhập với tài khoản Client | Chuyển hướng đến `/dashboard/client` |
| 2 | Đăng nhập với tài khoản Expert | Chuyển hướng đến `/dashboard/expert` |
| 3 | Truy cập route không có quyền (VD: Client vào `/dashboard/expert`) | Middleware chặn và đẩy về trang 403 hoặc trang chủ |

---

## 2. Quản lý Hồ sơ Người dùng (User Profile)

#### TC-PROF-001: Quản lý Portfolio của Expert
**Priority:** H
| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Expert truy cập phần Portfolio trong Profile | Hiển thị danh sách các Portfolio item |
| 2 | Bấm Add/Edit, điền tiêu đề, mô tả, ảnh, URL demo, kỹ năng | Lưu thành công, hiển thị trên Public Profile |

#### TC-PROF-002: Quản lý Skills & Profile info
**Priority:** M
| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Cập nhật Hourly Rate, Timezone, Bio | Thông tin được lưu chính xác |
| 2 | Thêm/Xóa các kỹ năng (Skills) | Danh sách tag kỹ năng cập nhật real-time |

---

## 3. Trợ lý Trí tuệ Nhân tạo (AI Modules Integration)

#### TC-AI-001: AI Enhance Job Posting (Client)
**Priority:** H
| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Client nhập tiêu đề và mô tả ngắn, bấm Enhance | Loading... |
| 2 | Hệ thống trả kết quả | Trả về Job Description chuyên nghiệp, **Suggested Budget**, và **Suggested Skills** |

#### TC-AI-002: AI Service Generator (Expert)
**Priority:** H
| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Expert nhập từ khóa (VD: "chatbot") và giá | Loading... |
| 2 | Nhấn Generate | Trả về tiêu đề, description dịch vụ chuẩn SEO |

#### TC-AI-003: AI Expert Recommendation
**Priority:** H
| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Client đăng Job thành công | Job chuyển sang Active |
| 2 | Xem danh sách AI Recommend | Hiển thị các Expert có skill/portfolio match nhất với Job requirements kèm Match Score |

---

## 4. Quản lý Dự án/Công việc (Jobs Management - Client Side)

#### TC-JOB-001: Đăng dự án mới với Timeline chi tiết
**Priority:** H
| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Client điền Title, Description, Budget, Skills | Form hợp lệ |
| 2 | Chỉ định **Timeline/Deadline** rõ ràng | Lưu thành công |
| 3 | Publish Job | Job hiển thị lên Marketplace cho Expert tìm kiếm |

#### TC-JOB-002: Quản lý "My Jobs"
**Priority:** M
| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Vào My Jobs | Thấy danh sách, có thể Edit/Delete khi job chưa có Contract |

---

## 5. Quản lý Dịch vụ (Services / Gigs - Expert Side)

#### TC-SVC-001: Tạo và kích hoạt Service
**Priority:** H
| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Expert tạo dịch vụ đóng gói (Service-based) | Lưu thành công (DRAFT / PENDING) |
| 2 | Kích hoạt (Activate) | Dịch vụ hiển thị public trên Marketplace |

---

## 6. Chào giá & Đấu thầu (Proposals)

#### TC-PROP-001: Submit Proposal
**Priority:** H
| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Expert xem Job, bấm Apply | Mở form Proposal |
| 2 | Gửi Cover letter, Bid amount, Timeline | Client nhận được Notification có Proposal mới |

#### TC-PROP-002: Phê duyệt Proposal sinh Contract
**Priority:** H
| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Client xem danh sách Proposals, bấm Accept | Proposal chuyển trạng thái Accepted |
| 2 | Kiểm tra hệ thống | **Hợp đồng (Contract) được tự động sinh ra**, liên kết Client, Expert, Job và Proposal |

---

## 7. Quản lý Hợp đồng & Cột mốc (Contracts & Milestones)

#### TC-CONT-001: Quản lý Milestone Deliverables
**Priority:** H
| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Expert nộp kết quả công việc (Submit Work) cho 1 Milestone | Milestone chuyển trạng thái Pending Review |
| 2 | Client bấm Approve | Tiền trong Escrow tương ứng Milestone lập tức Release sang ví Expert |
| 3 | Client bấm Reject | Milestone bị trả lại, Expert phải cập nhật lại |

---

## 8. Ví điện tử & Thanh toán (Wallet & Payments)

#### TC-PAY-001: Nạp tiền và Escrow Flow
**Priority:** H
| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Client Deposit (Stripe / Mock) | Balance ví Client tăng |
| 2 | Client bắt đầu Contract | Trạng thái chuyển `FUNDED`. Tiền bị trừ từ Balance, chuyển vào `LOCKED` (Escrow) |

#### TC-PAY-002: Rút tiền (Withdraw)
**Priority:** H
| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Expert tạo lệnh rút tiền (Withdraw) | Balance giảm, yêu cầu lưu chờ duyệt |
| 2 | Admin Approve lệnh rút | Giao dịch hoàn tất |

---

## 9. Hệ thống Khiếu nại (Disputes)

#### TC-DISP-001: Xử lý Khiếu nại
**Priority:** H
| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Mở Dispute cho Contract | Escrow bị đóng băng hoàn toàn |
| 2 | Admin giải quyết Dispute | Dựa trên phân định, Escrow chuyển `REFUNDED` (về Client) hoặc `RELEASED` (cho Expert) |

---

## 10. Trò chuyện (Chat System)

#### TC-CHAT-001: Real-time messaging
**Priority:** M
| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Khởi tạo chat giữa Client và Expert | Phòng chat được mở |
| 2 | Gắn tin nhắn | Cả 2 bên thấy tin nhắn lập tức |

---

## 11. Đánh giá & Nhận xét (Reviews & Ratings)

#### TC-REV-001: Đánh giá sau Contract
**Priority:** M
| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Contract hoàn thành toàn bộ | Client được quyền Rating & Review |
| 2 | Submit Review | Điểm trung bình của Expert trên Profile cập nhật |

---

## 12. Thông báo (Notifications)

#### TC-NOTI-001: Cập nhật thông báo
**Priority:** M
| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Khi có Milestone nộp/duyệt | Đối tác nhận được Notification đỏ |
| 2 | Click Mark as Read | Số lượng Unread Count giảm |

---

## 13. Quản trị Hệ thống (Admin Dashboard)

#### TC-ADM-001: Quản lý Users và Content
**Priority:** H
| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Admin khóa (Ban) một User | User đó lập tức không thể đăng nhập/thao tác |
| 2 | Admin gỡ bỏ Job/Service vi phạm | Nội dung biến mất khỏi Marketplace |

#### TC-ADM-002: Monitor Transactions & Analytics
**Priority:** M
| # | Bước thực hiện | Kết quả mong đợi |
|---|----------------|------------------|
| 1 | Vào màn Analytics | Thấy rõ biểu đồ Conversion rate, Success rate và tổng Escrow đang bị hold |

---

## 14. Mô hình Dữ liệu Cốt lõi (Core Data Entities)

*(Mục này dùng để Database Admin / Backend Developer đối chiếu, các TC kiểm tra tính toàn vẹn Dữ liệu như Foreign Keys, Cascading Delete sẽ dựa vào đây).*
- `JobPost` phải có liên kết với `User` (Client)
- Khi `Proposal` được Accept, phải sinh ra 1 `Contract` và ít nhất 1 `Milestone`.
- `Payment` Transaction phải map đúng với `Milestone` ID và `Wallet`.

---
*Tài liệu này được đồng bộ 100% với file SYSTEM_FEATURES.md của dự án AITasker.*
