# Hướng Dẫn Thiết Lập Các Dịch Vụ Môi Trường (Setup Guide)

Để dự án AI Freelance Marketplace có thể chạy hoàn chỉnh mọi tính năng (Gửi Email, Trí tuệ nhân tạo, Thanh toán, và Lưu trữ File), bạn cần cấu hình các API Key và thông tin dịch vụ vào file `.env` ở thư mục gốc của dự án. 

Dưới đây là hướng dẫn chi tiết từng bước để lấy các API Key và thiết lập.

---

## 1. Cấu Hình Email (SMTP)

Hệ thống sử dụng Email để gửi mã xác thực, đặt lại mật khẩu và các thông báo quan trọng. Cách dễ nhất ở môi trường phát triển là sử dụng **Gmail SMTP**.

### Cách thiết lập với Gmail:
1. Đăng nhập vào tài khoản Google của bạn, truy cập **Quản lý Tài khoản (Manage your Google Account)**.
2. Đi đến mục **Bảo mật (Security)**. Đảm bảo **Xác minh 2 bước (2-Step Verification)** đã được BẬT.
3. Tìm kiếm tính năng **Mật khẩu ứng dụng (App passwords)** trong thanh tìm kiếm của cài đặt bảo mật.
4. Tạo một mật khẩu ứng dụng mới (ví dụ đặt tên là "AI Freelance Local"). Google sẽ cung cấp cho bạn một chuỗi 16 ký tự.
5. Mở file `.env` và điền vào như sau:
   ```env
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USERNAME=your-email@gmail.com
   MAIL_PASSWORD=chuoi_16_ky_tu_google_cap
   ```

---

## 2. Cấu Hình Trí Tuệ Nhân Tạo (AI API)

Dự án hỗ trợ 2 nhà cung cấp AI là Anthropic (Claude) hoặc OpenAI (ChatGPT) cho các tính năng: *Gợi ý cải thiện Job*, *Tự động viết Service*, và *Đề xuất Chuyên gia*.

### Cách thiết lập OpenAI (Dễ nhất):
1. Truy cập [OpenAI Developer Platform](https://platform.openai.com/api-keys).
2. Đăng nhập và tạo một API Key mới (Create new secret key).
3. Mở file `.env` và sửa các dòng sau:
   ```env
   AI_PROVIDER=OPENAI
   OPENAI_API_KEY=sk-proj-xxxx... (Dán key của bạn vào đây)
   ```

### (Hoặc) Cách thiết lập Anthropic:
1. Truy cập [Anthropic Console](https://console.anthropic.com/settings/keys).
2. Tạo API Key mới.
3. Sửa file `.env`:
   ```env
   AI_PROVIDER=ANTHROPIC
   ANTHROPIC_API_KEY=sk-ant-xxxx...
   ```

---

## 3. Cấu Hình Thanh Toán (Stripe)

Stripe được dùng để xử lý nạp tiền (Deposit) thông qua thẻ Visa/Mastercard. Ở môi trường Local, bạn chỉ cần dùng môi trường Test của Stripe.

1. Đăng ký tài khoản tại [Stripe Dashboard](https://dashboard.stripe.com/).
2. Đảm bảo bạn đang bật chế độ **Test Mode** (Góc trên bên phải màn hình).
3. Truy cập mục **Developers > API Keys**.
4. Theo khuyến cáo bảo mật của Stripe, hãy chọn **Create restricted key** (thay vì dùng Secret key `sk_...` mặc định). Đặt tên cho key, cấp các quyền (Permissions) cần thiết (ví dụ: Write cho PaymentIntents), sau đó bấm tạo và sao chép mã **Restricted key** (bắt đầu bằng `rk_test_...`).
5. (Tùy chọn cho Webhook) Để nhận thông báo thanh toán thành công cục bộ, bạn cần cài đặt [Stripe CLI](https://docs.stripe.com/stripe-cli), đăng nhập và chạy lệnh:
   ```bash
   stripe listen --forward-to localhost:8080/api/v1/payments/webhook
   ```
   Lệnh trên sẽ in ra một dòng **Webhook Signing Secret** (Bắt đầu bằng `whsec_...`).
6. Điền vào `.env`:
   ```env
   STRIPE_SECRET_KEY=rk_test_xxxx...
   STRIPE_WEBHOOK_SECRET=whsec_xxxx...
   # Nếu bạn chưa muốn gọi lên Stripe thật lúc test, bạn có thể thiết lập STRIPE_MOCK=true (Tùy cấu hình)
   ```

---

## 4. Cấu Hình Lưu Trữ Đám Mây (AWS S3)

Hệ thống dùng AWS S3 để người dùng tải lên Avatar, Ảnh dịch vụ, và File bàn giao công việc (Deliverables).

1. Truy cập [AWS Console](https://console.aws.amazon.com/).
2. Mở dịch vụ **IAM (Identity and Access Management)** > **Users** > Tạo user mới (VD: `ai-market-dev`).
3. Gắn quyền (Attach policy) `AmazonS3FullAccess` cho User này.
4. Tạo **Access Key** cho User vừa tạo, lưu lại `Access Key ID` và `Secret Access Key`.
5. Mở dịch vụ **S3**, tạo một Bucket mới (Ví dụ: `aimarket-uploads-dev`). Nhớ bỏ chặn Public Access nếu bạn muốn user xem được ảnh thẳng từ link S3.
6. Cập nhật vào `.env`:
   ```env
   AWS_REGION=ap-southeast-1
   AWS_ACCESS_KEY_ID=AKIA...
   AWS_SECRET_ACCESS_KEY=xxxx...
   S3_BUCKET_NAME=aimarket-uploads-dev
   ```

---

## Tóm Lược
Sau khi bạn đã điền các thông tin này vào file `.env`, môi trường Backend (Spring Boot) sẽ tự động nạp (load) các thông số này để kết nối với các dịch vụ bên ngoài. Nếu bạn thiếu một trong các API này, một số tính năng cụ thể (Ví dụ: bấm nút "AI Enhance") sẽ báo lỗi `500 Internal Server Error`, nhưng các tính năng cơ bản của Web vẫn hoạt động bình thường.
