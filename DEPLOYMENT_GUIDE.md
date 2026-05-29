# Hướng Dẫn Triển Khai (Deployment Guide) - AI Freelance Marketplace

Tài liệu này ghi chú lại toàn bộ kiến trúc và các bước đã thực hiện để đưa dự án lên máy chủ thật (AWS), cũng như quy trình sử dụng GitHub để cập nhật code (CI/CD cơ bản) cho các lần chỉnh sửa sau này. Tài liệu này có thể được dùng làm Prompt/Context (bối cảnh) để hướng dẫn AI trong tương lai.

---

## 1. Kiến trúc hệ thống hiện tại trên AWS

Hệ thống đang được triển khai trên 3 dịch vụ chính của AWS để tối ưu hóa chi phí (Free Tier) và hiệu năng:

1. **Database (Cơ sở dữ liệu): AWS RDS (MySQL 8.0)**
   - **Cấu hình:** `db.t3.micro`, 20GB Storage, Public Access (Yes).
   - **Bảo mật:** Sử dụng Security Group riêng, cho phép EC2 kết nối qua Port 3306.

2. **Cache (Bộ nhớ đệm): AWS ElastiCache (Redis OSS)**
   - **Cấu hình:** `cache.t3.micro`, 0 Replicas, Multi-AZ (Disabled).
   - **Bảo mật:** Không bật "Encryption in transit" (để tránh lỗi SSL từ Spring Boot), cho phép EC2 kết nối qua Port 6379.

3. **Server (Máy chủ chạy Web/API): AWS EC2**
   - **Hệ điều hành:** Ubuntu 24.04 / 22.04 LTS.
   - **Cấu hình:** `t2.micro` hoặc `t3.micro` (1GB RAM).
   - **Tùy chỉnh thêm:** Đã tạo thêm **2GB RAM Ảo (Swap)** trên ổ cứng để tránh tình trạng sập nguồn (Out of Memory) khi build Java/React.
   - **Bảo mật (Security Group):** Mở Port 22 (SSH), Port 80 (HTTP), Port 443 (HTTPS) cho tất cả IP (0.0.0.0/0).

---

## 2. Cấu trúc Code trên Server

Thay vì chạy MySQL và Redis cục bộ (bằng Docker) như môi trường Dev, môi trường Production đã được tách ra:
- Sử dụng file **`docker-compose.prod.yml`**: Chỉ chứa 2 container là `backend` (Spring Boot) và `frontend` (React + Nginx).
- Sử dụng file **`.env.prod`**: Lưu trữ URL của AWS RDS, AWS ElastiCache, và các API Keys thật.

---

## 3. Quy trình Cập Nhật Code (Update/Deploy) bằng GitHub

Đây là quy trình chuẩn (phương án dùng GitHub) để cập nhật tính năng mới lên Server trong các lần sau:

### Bước 1: Code và đẩy lên GitHub (Thực hiện trên máy cá nhân)
1. Cập nhật code, test tính năng cẩn thận trên môi trường Local (chạy bằng `docker-compose.yml` gốc).
2. Khi đã ưng ý, lưu code và đẩy lên GitHub:
   ```bash
   git add .
   git commit -m "Cập nhật tính năng mới: [Mô tả tính năng]"
   git push origin main
   ```

### Bước 2: Đăng nhập vào Server AWS
1. Mở Terminal (Powershell) trên máy tính.
2. Dùng file chìa khóa (`.pem`) để SSH vào server:
   ```bash
   ssh -i aimarket-key.pem ubuntu@<IP_PUBLIC_CỦA_EC2>
   ```

### Bước 3: Kéo code mới về và Khởi chạy lại
1. Di chuyển vào thư mục chứa code trên server (ví dụ: `aimarket`):
   ```bash
   cd aimarket
   ```
2. Kéo code mới nhất từ GitHub về (Nếu server yêu cầu đăng nhập GitHub, hãy dùng Personal Access Token - PAT thay cho mật khẩu):
   ```bash
   git pull origin main
   ```
3. Chạy lệnh Build lại hệ thống bằng Docker Compose:
   ```bash
   sudo docker compose -f docker-compose.prod.yml up -d --build
   ```
   *(Nhờ cơ chế Cache của Docker, lần build này sẽ rất nhanh, thường chỉ 1-2 phút).*

4. Kiểm tra Logs để đảm bảo mọi thứ khởi động thành công:
   ```bash
   sudo docker compose -f docker-compose.prod.yml logs -f
   ```
   *(Nhấn Ctrl + C để thoát màn hình xem Logs).*

---

## 4. Các lưu ý quan trọng (Troubleshooting)

- **Lỗi SSH "UNPROTECTED PRIVATE KEY FILE":** Trên Windows, file `.pem` bắt buộc phải xóa hết quyền thừa hưởng và chỉ cấp quyền Read cho đúng 1 user hiện tại. (Đã dùng lệnh `icacls` để fix trong lần cài đặt đầu).
- **Lỗi hết RAM (Killed / Exit Code 137):** Nếu khi chạy `npm run build` hoặc `mvn package` mà quá trình bị chết ngang, đó là do server hết RAM. Kiểm tra lại Swap bằng lệnh `free -h` xem Swap 2GB có đang hoạt động hay không.
- **Không truy cập được IP:** Kiểm tra lại Inbound Rules của Security Group gắn vào EC2 xem Port 80 đã được cấp phép (0.0.0.0/0) chưa.

dia chi ip hiện tại 54.206.116.105
