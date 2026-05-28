const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

// Maps for translation (Vietnamese -> English)
const translations = [
  // Common terms
  { from: /Đăng nhập/g, to: 'Sign In' },
  { from: /Đăng ký/g, to: 'Sign Up' },
  { from: /Đăng xuất/g, to: 'Sign Out' },
  { from: /Trang chủ/g, to: 'Home' },
  { from: /Mật khẩu/g, to: 'Password' },
  { from: /Quên mật khẩu\?/g, to: 'Forgot Password?' },
  { from: /Tài khoản/g, to: 'Account' },
  { from: /Hồ sơ/g, to: 'Profile' },
  { from: /Cài đặt/g, to: 'Settings' },
  { from: /Ví tiền/g, to: 'Wallet' },
  { from: /Hợp đồng/g, to: 'Contracts' },
  { from: /Tin nhắn/g, to: 'Messages' },
  { from: /Thông báo/g, to: 'Notifications' },
  { from: /Dịch vụ/g, to: 'Services' },
  { from: /Công việc/g, to: 'Jobs' },
  { from: /Tìm việc/g, to: 'Find Jobs' },
  { from: /Tìm chuyên gia/g, to: 'Find Experts' },
  { from: /Đăng việc/g, to: 'Post a Job' },
  { from: /Đăng dịch vụ/g, to: 'Post a Service' },
  { from: /Chợ dịch vụ/g, to: 'Marketplace' },
  { from: /Tìm kiếm/g, to: 'Search' },
  { from: /Lưu/g, to: 'Save' },
  { from: /Hủy/g, to: 'Cancel' },
  { from: /Đóng/g, to: 'Close' },
  { from: /Xác nhận/g, to: 'Confirm' },
  { from: /Chỉnh sửa/g, to: 'Edit' },
  { from: /Xóa/g, to: 'Delete' },
  { from: /Thêm mới/g, to: 'Add New' },
  { from: /Gửi/g, to: 'Send' },
  { from: /Gửi yêu cầu/g, to: 'Send Request' },
  { from: /Trạng thái/g, to: 'Status' },
  { from: /Hoàn thành/g, to: 'Completed' },
  { from: /Đang tiến hành/g, to: 'In Progress' },
  { from: /Đang chờ/g, to: 'Pending' },
  { from: /Hủy bỏ/g, to: 'Cancelled' },
  { from: /Giá/g, to: 'Price' },
  { from: /Ngân sách/g, to: 'Budget' },
  { from: /Kỹ năng/g, to: 'Skills' },
  { from: /Mô tả/g, to: 'Description' },
  { from: /Tên/g, to: 'Name' },
  { from: /Email/g, to: 'Email' },
  { from: /Chi tiết/g, to: 'Details' },
  { from: /Đánh giá/g, to: 'Reviews' },
  { from: /Bảng điều khiển/g, to: 'Dashboard' },
  { from: /Quản lý/g, to: 'Manage' },
  { from: /Người dùng/g, to: 'Users' },
  { from: /Không có quyền truy cập/g, to: 'Access Denied' },
  { from: /Đang tải/g, to: 'Loading' },
  { from: /Không tìm thấy/g, to: 'Not Found' },
  { from: /Chưa có/g, to: 'None yet' },
  { from: /Tạo mới/g, to: 'Create' },
  { from: /Đề xuất/g, to: 'Proposals' },
  { from: /Ứng viên/g, to: 'Candidates' },
  { from: /Chấp nhận/g, to: 'Accept' },
  { from: /Từ chối/g, to: 'Reject' },
];

// Maps for styling (Dark/Purple -> Light/Royal Blue)
const styles = [
  { from: /bg-surface-950/g, to: 'bg-slate-50' },
  { from: /bg-surface-900/g, to: 'bg-white' },
  { from: /bg-surface-800/g, to: 'bg-white border border-slate-200' },
  { from: /bg-surface-700/g, to: 'bg-slate-100 border border-slate-200' },
  { from: /bg-surface-600/g, to: 'bg-slate-200' },
  
  { from: /hover:bg-surface-800/g, to: 'hover:bg-slate-50' },
  { from: /hover:bg-surface-700/g, to: 'hover:bg-slate-100' },
  { from: /hover:bg-surface-600/g, to: 'hover:bg-slate-200' },
  
  { from: /border-surface-800/g, to: 'border-slate-200' },
  { from: /border-surface-700/g, to: 'border-slate-300' },
  { from: /border-surface-600/g, to: 'border-slate-300' },
  
  { from: /text-white/g, to: 'text-slate-900' },
  { from: /text-slate-300/g, to: 'text-slate-600' },
  { from: /text-slate-400/g, to: 'text-slate-500' },
  { from: /text-slate-500/g, to: 'text-slate-400' },
  
  { from: /text-surface-300/g, to: 'text-slate-600' },
  { from: /text-surface-400/g, to: 'text-slate-500' },
  { from: /text-surface-500/g, to: 'text-slate-400' },

  { from: /ring-surface-700/g, to: 'ring-slate-300' },
  { from: /ring-surface-800/g, to: 'ring-slate-200' },

  { from: /divide-surface-800/g, to: 'divide-slate-200' },
  { from: /divide-surface-700/g, to: 'divide-slate-200' },
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Apply translations
  translations.forEach(t => {
    content = content.replace(t.from, t.to);
  });

  // Apply styling replaces
  styles.forEach(t => {
    content = content.replace(t.from, t.to);
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function traverseDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

traverseDir(srcDir);
console.log("Transformation complete.");
