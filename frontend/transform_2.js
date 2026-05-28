const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const translations = [
  { from: /Ví của tôi/g, to: 'My Wallet' },
  { from: /Số dư khả dụng/g, to: 'Available Balance' },
  { from: /Đang khóa \(escrow\)/g, to: 'Locked (Escrow)' },
  { from: /Nạp tiền/g, to: 'Deposit' },
  { from: /Rút tiền/g, to: 'Withdraw' },
  { from: /Tổng đã nạp/g, to: 'Total Deposited' },
  { from: /Tổng đã giải ngân/g, to: 'Total Disbursed' },
  { from: /None yet giao dịch nào/g, to: 'No transactions yet' },
  { from: /Profile của tôi/g, to: 'My Profile' },
  { from: /Chưa cập nhật tên/g, to: 'Name not updated' },
  { from: /Vai trò/g, to: 'Role' },
  { from: /Họ và tên/g, to: 'Full Name' },
  { from: /Cập nhật hồ sơ/g, to: 'Update Profile' },
  { from: /Tính năng đang phát triển — sẽ có trong phiên bản tiếp theo\./g, to: 'Feature in development — coming in the next version.' },
  { from: /Trang không tồn tại/g, to: 'Page Not Found' },
  { from: /Trang bạn đang tìm kiếm đã bị xóa hoặc không tồn tại\./g, to: 'The page you are looking for has been removed or does not exist.' },
  { from: /Về trang chủ/g, to: 'Back to Home' },
  { from: /Not Found dịch vụ này\./g, to: 'Service not found.' },
  { from: /← Quay lại Marketplace/g, to: '← Back to Marketplace' },
  { from: /đánh giá/g, to: 'reviews' },
  { from: /Description dịch vụ/g, to: 'Service Description' },
  { from: /Price dịch vụ/g, to: 'Service Price' },
  { from: /ngày/g, to: 'days' },
  { from: /đơn/g, to: 'orders' },
  { from: /Tư vấn miễn phí/g, to: 'Free Consultation' },
  { from: /Bảo hành 30 ngày/g, to: '30-day Warranty' },
  { from: /Thanh toán an toàn qua Escrow/g, to: 'Secure Escrow Payment' },
  { from: /Đặt dịch vụ ngay/g, to: 'Order Service Now' },
  { from: /Sign In để đặt/g, to: 'Sign In to Order' },
  { from: /Mới nhất/g, to: 'Newest' },
  { from: /Price tăng dần/g, to: 'Price: Low to High' },
  { from: /Price giảm dần/g, to: 'Price: High to Low' },
  { from: /dịch vụ AI/g, to: 'AI Services' },
  { from: /Tạo dịch vụ/g, to: 'Create Service' },
  { from: /Tìm dịch vụ AI\.\.\./g, to: 'Search AI services...' },
  { from: /Price tối thiểu/g, to: 'Minimum Price' },
  { from: /Price tối đa/g, to: 'Maximum Price' },
  { from: /Giao hàng tối đa \(ngày\)/g, to: 'Max Delivery (days)' },
  { from: /Rating tối thiểu/g, to: 'Minimum Rating' },
  { from: /Tất cả/g, to: 'All' },
  { from: /Delete bộ lọc/g, to: 'Clear filters' },
  { from: /Lỗi khi tải dịch vụ\. Thử lại sau\./g, to: 'Error loading services. Please try again.' },
  { from: /None yet dịch vụ nào/g, to: 'No services found' },
  { from: /← Trước/g, to: '← Prev' },
  { from: /Tiếp →/g, to: 'Next →' },
  { from: /Tiêu đề ít nhất 10 ký tự/g, to: 'Title must be at least 10 characters' },
  { from: /Description ít nhất 50 ký tự/g, to: 'Description must be at least 50 characters' },
  { from: /Price phải lớn hơn 0/g, to: 'Price must be greater than 0' },
  { from: /Thời gian giao hàng phải lớn hơn 0/g, to: 'Delivery time must be greater than 0' },
  { from: /Tạo dịch vụ thành công!/g, to: 'Service created successfully!' },
  { from: /Tạo dịch vụ thất bại, thử lại sau/g, to: 'Failed to create service, try again' },
  { from: /AI đã tạo mô tả dịch vụ cho bạn!/g, to: 'AI generated a service description for you!' },
  { from: /Nhờ AI viết mô tả/g, to: 'Ask AI to write description' },
  { from: /Loading\.\.\./g, to: 'Loading...' },
  { from: /Tiêu đề dịch vụ/g, to: 'Service Title' },
  { from: /Mô tả chi tiết/g, to: 'Detailed Description' },
  { from: /Price \(\$\)/g, to: 'Price ($)' },
  { from: /Thời gian giao hàng \(ngày\)/g, to: 'Delivery Time (days)' },
  { from: /Tạo Dịch Vụ/g, to: 'Create Service' },
  { from: /Dự án/g, to: 'Projects' },
  { from: /Thành công/g, to: 'Success' },
  { from: /Đang làm/g, to: 'In Progress' },
  { from: /Dịch vụ đang hoạt động/g, to: 'Active Services' },
  { from: /Việc làm đã nhận/g, to: 'Accepted Jobs' },
  { from: /Dự án gần đây/g, to: 'Recent Projects' },
  { from: /Lỗi khi tải Jobs\. Thử lại sau\./g, to: 'Error loading Jobs. Please try again.' },
  { from: /None yet Job nào/g, to: 'No Jobs yet' },
  { from: /Lỗi/g, to: 'Error' },
  { from: /Không có/g, to: 'None' },
  { from: /Tất cả dự án/g, to: 'All Projects' },
  { from: /Quản trị viên/g, to: 'Admin' },
  { from: /Chuyên gia/g, to: 'Expert' },
  { from: /Khách hàng/g, to: 'Client' },
  { from: /Quản lý/g, to: 'Management' },
  { from: /Việc làm/g, to: 'Jobs' },
  { from: /Nhắn tin/g, to: 'Message' },
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  translations.forEach(t => {
    content = content.replace(t.from, t.to);
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated translations in: ${filePath}`);
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
console.log("Deep Translation complete.");
