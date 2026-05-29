# Báo cáo Kiểm thử Lỗi (Bug Verification Report)

**Thời gian kiểm thử:** 2026-05-29
**Môi trường:** Production (http://54.206.116.105)

---

## 1. BUG-004: Lỗi đăng nhập sai (Login Error Toast)
*   **Trạng thái:** ❌ **Không hiển thị thông báo lỗi trên UI.**
*   **Hành động:** Đăng nhập với tài khoản `nonexistent@example.com` / `wrongpassword123`.
*   **Kết quả API:** Backend trả về đúng `401 Unauthorized`. 
*   **Kết quả UI:** Trang không bị reload (fix interceptor đã hoạt động), nhưng Toast hiển thị lỗi (Invalid email or password) vẫn không xuất hiện. Form giữ nguyên giá trị nhập.
*   **Phân tích nguyên nhân tiềm năng:** Mặc dù Interceptor không còn redirect (đã fix), nhưng Promise bị reject có thể không được luân chuyển (propagate) đúng cách qua hàm `login` trong Zustand store (`authStore.ts`). Zustand `try-finally` block không có `catch` có thể gặp vấn đề về unhandled promise rejection trong một số cấu hình Vite/React nhất định, khiến hàm `onSubmit` trong `LoginPage.tsx` không bắt được lỗi.

## 2. BUG-005: Lỗi đăng ký trùng Email (Register Error Toast)
*   **Trạng thái:** ❌ **Không hiển thị thông báo lỗi trên UI.**
*   **Hành động:** Đăng ký với email đã tồn tại (`e2e_expert_test@example.com`).
*   **Kết quả API:** Backend trả về đúng `409 Conflict`.
*   **Kết quả UI:** Form giữ nguyên giá trị, nút "Sign Up" chạy xong nhưng không có Toast thông báo lỗi.
*   **Phân tích nguyên nhân tiềm năng:** Tương tự như BUG-004, lỗi xảy ra khi Promise.reject từ Axios không đi vào block `catch` của `RegisterPage.tsx`. Cần bổ sung thêm block `catch` rõ ràng vào action `register` trong `authStore.ts` để ném lỗi lên UI (ví dụ: `catch (e) { throw e; }`).

## 3. BUG-001: Nút "AI Generate" không điền nội dung
*   **Trạng thái:** ✅ **Đã FIX thành công phần Frontend (Lỗi 500 & Map Field).** Tuy nhiên, trả về thông báo lỗi fallback của Backend.
*   **Hành động:** Điền Title và Keywords, bấm "AI Generate".
*   **Kết quả API:** Trả về `200 OK` với dữ liệu JSON hợp lệ.
*   **Kết quả UI:** Ô Description được điền thành công câu: `"AI tạm thời không khả dụng. Vui lòng nhập mô tả thủ công."`.
*   **Kết luận:** 
    *   **Frontend đã hoạt động hoàn hảo 100%**: Nó đã map đúng các field (`keywords`, `deliveryDays`, `price`), nhận được response từ API và **hiển thị nội dung vào textarea thành công**. 
    *   Việc hiển thị dòng chữ báo lỗi trên là do **Backend (Spring Boot) không gọi được Anthropic API** (có thể do thiếu biến môi trường API Key, hoặc rate limit). Backend đã chủ động ném ra câu thông báo fallback này. Đây **không phải là lỗi giao diện (BUG-001 đã fix)** mà là vấn đề cấu hình môi trường AWS cho backend.
