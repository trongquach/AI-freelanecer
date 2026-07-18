# TÀI LIỆU CẤU HÌNH & DEPLOYMENT TRÊN VPS
**Dự án:** AIMarket — AI Freelance Marketplace
**Cập nhật lần cuối:** Bất cứ thay đổi nào trên VPS cũng nên được ghi chú lại vào file này.

---

## 1. THÔNG TIN CHUNG (SERVER INFO)
- **VPS IP:** `116.118.6.40`
- 📖 **Tài liệu API Swagger UI**: [http://116.118.6.40:18080/swagger-ui/index.html](http://116.118.6.40:18080/swagger-ui/index.html)
- **Domain Đang Chạy:** `aimarketswp.duckdns.org` (và IP trực tiếp)
- **OS:** Ubuntu / Debian (Linux)
- **Môi trường:** Docker Compose (Chạy toàn bộ dịch vụ trong container cách ly)
- **Root User:** root (Nếu là Linux) hoặc administrator (Nếu là Windows)
- **Root Password:** &UTrh@FRHRDeDq6
---

## 2. CẤU TRÚC THƯ MỤC TRÊN VPS
Toàn bộ mã nguồn và cấu hình được đặt tại thư mục:
👉 **`/var/www/aimarket`**

Bao gồm các file và thư mục quan trọng:
- `docker-compose.vps.yml`: File chạy cấu hình kiến trúc Docker.
- `.env`: File chứa các biến môi trường bảo mật (Database password, JWT Secret...).
- `frontend/`: Chứa mã nguồn React và `nginx.conf` nội bộ của frontend.
- `backend/`: Chứa mã nguồn Spring Boot.
- `aimarket_db.sql` & `seed_data.sql`: Các file tự động khởi tạo database khi lần đầu chạy.

---

## 3. KIẾN TRÚC DOCKER (CONTAINERS)
Hệ thống sử dụng mạng nội bộ ảo `aimarket-vps-network` để các container nói chuyện với nhau. 
Gồm 4 container đang chạy nền:

| Tên Container | Hình ảnh (Image) | Cổng Máy Chủ (Exposed) | Chức năng |
| :--- | :--- | :--- | :--- |
| **`aimarket-mysql-prod`** | `mysql:8.0` | `3307` | Database chính. Có map ra port 3307 để dùng DataGrip/DBeaver. |
| **`aimarket-phpmyadmin-prod`**| `phpmyadmin` | `8081` | Giao diện quản trị Database trực quan trên trình duyệt. |
| **`aimarket-backend-prod`**| `Spring Boot` (Java 21) | `18080` | Xử lý API & Websocket, kết nối tới DB. |
| **`aimarket-frontend-prod`**| `Nginx + React` (Node 18) | `127.0.0.1:13000` | Giao diện người dùng. Proxy ngược gọi tới backend. |

---

## 4. QUY TẮC ĐỊNH TUYẾN (NGINX RULES)
Dự án sử dụng **2 tầng Nginx** để tối ưu và bảo mật:

### Tầng 1: Nginx Chính Trên Máy Chủ (Host VPS)
- **Vị trí config:** `/etc/nginx/conf.d/aimarket.conf`
- **Chức năng:** Lắng nghe Port `80` (Internet) và chia luồng:
  - Yêu cầu tới `/api/*` 👉 Chuyển thẳng xuống Backend ở `127.0.0.1:18080`
  - Yêu cầu tới `/ws/*` 👉 Chuyển xuống Backend Websocket ở `127.0.0.1:18080` kèm rule `Upgrade`.
  - Còn lại (Truy cập web) 👉 Chuyển xuống Frontend ở `127.0.0.1:13000`

### Tầng 2: Nginx Bên Trong Docker Frontend
- **Vị trí config:** `/var/www/aimarket/frontend/nginx.conf`
- **Chức năng:** 
  - Host file tĩnh của React (`index.html`, js, css...).
  - Quản lý bộ nhớ đệm (Cache tĩnh).
  - Tự động bắt lỗi 404 và trả về `index.html` (để React Router hoạt động bình thường).
  - Có các rule bảo mật Header (XSS, Frame-Options...).

---

## 5. CÁC LỆNH QUẢN TRỊ DÀNH CHO DEVELOPER (GỬI BẠN CỦA BẠN)

Nếu bạn của bạn đăng nhập SSH vào VPS (`root@116.118.6.40`), họ cần dùng các lệnh sau để thao tác:

**A. Di chuyển vào thư mục dự án (Bắt buộc trước khi chạy lệnh khác):**
```bash
cd /var/www/aimarket
```

**B. Xem trạng thái các container (Xem có sống hay chết):**
```bash
docker ps
```

**C. Khởi động lại toàn bộ hệ thống (Restart):**
```bash
/usr/local/bin/docker-compose -f docker-compose.vps.yml restart
```

**D. Cập nhật code mới và Build lại (Nếu bạn up file code mới lên FTP):**
```bash
# Build lại backend:
/usr/local/bin/docker-compose -f docker-compose.vps.yml up -d --build backend

# Build lại frontend:
/usr/local/bin/docker-compose -f docker-compose.vps.yml up -d --build frontend
```

**E. Xem Log Lỗi (Debug):**
```bash
# Xem log Backend (hiện 50 dòng cuối):
docker logs aimarket-backend-prod --tail 50

# Xem log Frontend:
docker logs aimarket-frontend-prod --tail 50
```

**F. Sửa cấu hình tên miền ở Nginx tổng:**
```bash
# Mở file để sửa đổi
nano /etc/nginx/conf.d/aimarket.conf

# Sau khi sửa xong, lưu lại và chạy lệnh này để áp dụng
nginx -t && systemctl reload nginx
```

---

## 6. LỖI THƯỜNG GẶP (TROUBLESHOOTING & KNOWN ISSUES)

### Lỗi 403 Forbidden khi đăng ký/gọi API qua Nginx
- **Triệu chứng:** Khi truy cập API trực tiếp qua cổng 18080 thì hoạt động (hoặc trả về 400 Bad Request), nhưng khi truy cập qua cổng 80 (Nginx proxy) thì bị ném lỗi `403 Forbidden` do Spring Security đánh chặn (`AccessDeniedException`).
- **Nguyên nhân gốc rễ:** Trong `frontend/nginx.conf`, khi sử dụng biến động để phân giải DNS (ví dụ: `set $backend_host backend; proxy_pass http://$backend_host:8080;`), NGINX sẽ tự động tắt tính năng nối đuôi URI (auto-append URI). Hậu quả là request `POST /api/v1/auth/register` bị cắt đuôi, chỉ còn `POST /api/` khi gửi cho Spring Boot. Spring Security không tìm thấy `/api/` trong danh sách `.permitAll()` nên đã chặn request bằng lỗi 403.
- **Cách khắc phục:** Luôn phải chèn thêm biến `$request_uri` vào cuối lệnh `proxy_pass` khi sử dụng biến cấu hình host để đảm bảo Nginx truyền toàn bộ đường dẫn lên Backend. Ví dụ:
  ```nginx
  location /api/ {
      set $backend_host backend;
      proxy_pass http://$backend_host:8080$request_uri;
  }
  ```
