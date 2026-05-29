const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const translations = [
  // Generic / Common
  { from: /Quay lại/g, to: 'Back' },
  { from: /Tìm kiếm/g, to: 'Search' },
  { from: /Đang tải/g, to: 'Loading' },
  { from: /Lỗi/g, to: 'Error' },
  { from: /Thành công/g, to: 'Success' },
  { from: /Không tìm thấy/g, to: 'Not Found' },
  { from: /Chưa cập nhật/g, to: 'Not updated' },
  { from: /Chi tiết/g, to: 'Details' },
  { from: /Tất cả/g, to: 'All' },
  { from: /Hạn chót/g, to: 'Deadline' },
  { from: /Đăng bởi/g, to: 'Posted by' },
  { from: /ẩn danh/g, to: 'anonymous' },

  // Toast / Messages
  { from: /Tạo việc làm thành công!/g, to: 'Job created successfully!' },
  { from: /Tạo việc làm thất bại, thử lại sau/g, to: 'Failed to create job, try again later' },
  { from: /AI đã tối ưu hóa mô tả công việc của bạn!/g, to: 'AI optimized your job description!' },
  { from: /AI gặp lỗi khi xử lý, vui lòng thử lại\./g, to: 'AI encountered an error, please try again.' },
  { from: /Đăng dự án thành công!/g, to: 'Project published successfully!' },
  { from: /Lỗi khi đăng dự án\. Vui lòng thử lại\./g, to: 'Error publishing project. Please try again.' },
  { from: /Create Service thành công!/g, to: 'Service created successfully!' },
  { from: /Create Service thất bại, thử lại sau/g, to: 'Failed to create service, try again' },
  { from: /AI gặp lỗi khi tạo mô tả, vui lòng thử lại\./g, to: 'AI encountered an error generating description, please try again.' },
  { from: /Lưu hồ sơ thành công!/g, to: 'Profile saved successfully!' },
  { from: /Lỗi khi lưu hồ sơ\./g, to: 'Error saving profile.' },
  { from: /Chấp nhận đề xuất thành công/g, to: 'Proposal accepted successfully' },
  { from: /Lỗi khi thao tác/g, to: 'Error processing action' },
  
  // Create Job Page
  { from: /Post a Job mới/g, to: 'Post a New Job' },
  { from: /Find Experts AI phù hợp/g, to: 'Find suitable AI Experts' },
  { from: /Tiêu đề dự án/g, to: 'Project Title' },
  { from: /Xây dựng chatbot AI cho e-commerce\.\.\./g, to: 'Build AI chatbot for e-commerce...' },
  { from: /Description chi tiết/g, to: 'Detailed Description' },
  { from: /Description yêu cầu kỹ thuật, mục tiêu, kết quả mong đợi\.\.\./g, to: 'Describe technical requirements, goals, expected outcomes...' },
  { from: /Budget tối thiểu/g, to: 'Minimum Budget' },
  { from: /Budget tối đa/g, to: 'Maximum Budget' },
  { from: /Đang tạo\.\.\./g, to: 'Creating...' },
  
  // Job Detail Page
  { from: /All việc làm/g, to: 'All jobs' },
  { from: /lượt xem/g, to: 'views' },
  { from: /Skills yêu cầu/g, to: 'Required Skills' },
  { from: /Client ẩn danh/g, to: 'Anonymous Client' },
  { from: /Send đề xuất/g, to: 'Send Proposal' },
  { from: /Publish Dự án/g, to: 'Publish Project' },
  { from: /AI Proposals chuyên gia/g, to: 'AI Expert Proposals' },
  { from: /Xem hồ sơ/g, to: 'View Profile' },
  
  // Jobs Page
  { from: /dự án đang tuyển/g, to: 'jobs hiring' },
  { from: /Tìm theo tên, kỹ năng, mô tả\.\.\./g, to: 'Search by name, skill, description...' },
  { from: /Lọc/g, to: 'Filter' },
  
  // Create Service Page
  { from: /Create Service Mới/g, to: 'Create New Service' },
  { from: /Close gói kỹ năng của bạn thành AI Services/g, to: 'Package your skills into AI Services' },
  { from: /Tôi sẽ phát triển mô hình Machine Learning\.\.\./g, to: 'I will develop a Machine Learning model...' },
  { from: /Skills sử dụng \(Cách nhau bởi dấu phẩy\)/g, to: 'Skills used (Comma separated)' },
  { from: /Description chi tiết những gì bạn sẽ cung cấp trong dịch vụ này\.\.\./g, to: 'Detailed description of what you will provide in this service...' },
  { from: /Price trọn gói/g, to: 'Package Price' },
  { from: /Đăng Dịch Vụ/g, to: 'Publish Service' },
  
  // Marketplace Page
  { from: /Tìm AI Services\.\.\./g, to: 'Search AI Services...' },
  
  // Admin & Expert Dashboards
  { from: /Tổng người dùng/g, to: 'Total Users' },
  { from: /Tổng doanh thu/g, to: 'Total Revenue' },
  { from: /Giao dịch mới/g, to: 'New Transactions' },
  { from: /Dịch vụ đang hoạt động/g, to: 'Active Services' },
  { from: /Hoạt động gần đây/g, to: 'Recent Activity' },
  { from: /Chờ duyệt/g, to: 'Pending Approval' },
  { from: /Đang rảnh/g, to: 'Available' },
  { from: /Doanh thu tháng/g, to: 'Monthly Revenue' },
  { from: /Mới/g, to: 'New' },
  { from: /Người dùng mới tham gia/g, to: 'New user joined' },
  
  // Navbar / Layout / UI
  { from: /Trang chủ/g, to: 'Home' },
  { from: /Việc làm/g, to: 'Jobs' },
  { from: /Dịch vụ/g, to: 'Services' },
  { from: /Đăng nhập/g, to: 'Sign In' },
  { from: /Đăng ký/g, to: 'Sign Up' },
  { from: /Đăng xuất/g, to: 'Sign Out' },
  { from: /Hồ sơ/g, to: 'Profile' },
  { from: /Bảng điều khiển/g, to: 'Dashboard' },
  { from: /Quản lý hệ thống/g, to: 'System Management' },
  
  // Notification Bell
  { from: /Thông báo/g, to: 'Notifications' },
  { from: /Không có thông báo mới/g, to: 'No new notifications' },
  { from: /vừa gửi một đề xuất/g, to: 'just sent a proposal' },
  { from: /đã được thanh toán/g, to: 'has been paid' },
  { from: /tin nhắn mới từ/g, to: 'new message from' },
  
  // Chat Widget
  { from: /Nhập tin nhắn\.\.\./g, to: 'Type a message...' },
  { from: /Gửi/g, to: 'Send' },
  { from: /Trò chuyện/g, to: 'Chat' },
  
  // Profile
  { from: /Giới thiệu bản thân/g, to: 'About me' },
  { from: /Chuyên môn chính/g, to: 'Main expertise' },
  { from: /Lưu thay đổi/g, to: 'Save Changes' },
  
  // Others
  { from: /Không có quyền truy cập/g, to: 'Access Denied' },
  { from: /lượt bán/g, to: 'sales' },
  { from: /đánh giá/g, to: 'reviews' },
  { from: /Từ chối/g, to: 'Reject' },
  { from: /Chấp nhận/g, to: 'Accept' },
  { from: /Đề xuất/g, to: 'Proposals' },
  { from: /Trạng thái/g, to: 'Status' }
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  translations.forEach(t => {
    content = content.replace(t.from, t.to);
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Translated: ${filePath}`);
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
console.log("Translation process complete.");
