const fs = require('fs');
const path = require('path');

const replacements = [
  // WalletPage
  { from: /đã được nạp vào ví thành công/g, to: 'has been successfully deposited to wallet' },
  { from: /Nạp tiền thất bại\. Vui lòng thử lại\./g, to: 'Deposit failed. Please try again.' },
  { from: /Vui lòng nhập số tiền hợp lệ\./g, to: 'Please enter a valid amount.' },
  { from: /Nạp tiền vào ví/g, to: 'Deposit to wallet' },
  { from: /Nhập số tiền bạn muốn nạp\. Hệ thống đang chạy ở chế độ/g, to: 'Enter the amount you want to deposit. The system is running in' },
  { from: /Sandbox \(giả lập\)/g, to: 'Sandbox' },
  { from: /, tiền sẽ được cộng ngay lập tức\./g, to: ' mode, funds will be added instantly.' },
  { from: /Hủy/g, to: 'Cancel' },
  { from: /Đang xử lý\.\.\./g, to: 'Processing...' },
  { from: /Xác nhận nạp/g, to: 'Confirm Deposit' },

  // ServiceDetailPage
  { from: /Bảo hành 30 days/g, to: '30 days warranty' },

  // MarketplacePage
  { from: /Giao hàng tối đa \(days\)/g, to: 'Max delivery (days)' },

  // ExpertDashboard
  { from: /Đang hoạt động/g, to: 'Active' },
  { from: /Chào mừng/g, to: 'Welcome' },
  { from: /Manage dịch vụ và đề xuất dự án/g, to: 'Manage services and project proposals' },
  { from: /Services của tôi/g, to: 'My Services' },
  { from: /Xem tất cả/g, to: 'View all' },
  { from: /Bạn chưa có dịch vụ nào/g, to: 'You have no services yet' },
  { from: /Create Service đầu tiên/g, to: 'Create first Service' },
  { from: /Xem số dư và giao dịch/g, to: 'View balance and transactions' },
  { from: /Profile chuyên gia/g, to: 'Expert Profile' },
  { from: /Cập nhật kỹ năng/g, to: 'Update skills' },

  // ClientDashboard
  { from: /Tổng việc đăng/g, to: 'Total jobs posted' },
  { from: /Đang tuyển/g, to: 'Recruiting' },
  { from: /Đang thực hiện/g, to: 'In progress' },
  { from: /Xin chào/g, to: 'Hello' },
  { from: /Manage dự án và tìm chuyên gia AI/g, to: 'Manage projects and find AI experts' },
  { from: /Jobs gần đây/g, to: 'Recent Jobs' },
  { from: /Bạn chưa đăng việc nào/g, to: 'You haven\'t posted any jobs yet' },
  { from: /Post a Job đầu tiên/g, to: 'Post first Job' },
  { from: /Contracts đang chạy/g, to: 'Active Contracts' },
  { from: /Các hợp đồng đang thực hiện sẽ hiển thị ở đây\./g, to: 'Active contracts will be displayed here.' },
  { from: /Duyệt Marketplace/g, to: 'Browse Marketplace' },
  { from: /Tìm AI Services sẵn có/g, to: 'Find available AI Services' },
  { from: /Manage thanh toán/g, to: 'Manage payments' },

  // JobDetailPage
  { from: /Error khi đăng dự án\. Vui lòng thử lại\./g, to: 'Error posting project. Please try again.' },
  { from: /Not Found việc làm này\./g, to: 'Job not found.' },
  { from: /Đã đăng/g, to: 'Posted' },

  // AdminDashboard
  { from: /Đã cấm người dùng/g, to: 'User banned' },
  { from: /Services đã được duyệt/g, to: 'Services approved' },
  { from: /Services đã bị từ chối/g, to: 'Services rejected' },
  { from: /Tổng việc làm/g, to: 'Total Jobs' },
  { from: /Việc đang tuyển/g, to: 'Open Jobs' },
  { from: /Tổng dịch vụ/g, to: 'Total Services' },
  { from: /Tổng giao dịch/g, to: 'Total Transactions' },
  { from: /Phí nền tảng \(10\%\)/g, to: 'Platform Fee (10%)' },
  { from: /Manage toàn bộ nền tảng AIMarket/g, to: 'Manage entire AIMarket platform' },
  { from: /Tài chính/g, to: 'Finance' },
  { from: /Hành động nhanh/g, to: 'Quick Actions' },
  { from: /Duyệt dịch vụ/g, to: 'Approve Services' },
  { from: /Phê duyệt hoặc từ chối dịch vụ chờ duyệt/g, to: 'Approve or reject pending services' },
  { from: /Manage dịch vụ/g, to: 'Manage services' },

  // Additional common words found in previous run or context
  { from: /Từ/g, to: 'From' },
  { from: /chuyên gia AI/gi, to: 'AI Experts' },
  { from: /hàng đầu/g, to: 'Top-tier' }
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      processDirectory(filePath);
    } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let originalContent = content;
      for (const rule of replacements) {
        content = content.replace(rule.from, rule.to);
      }
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${filePath}`);
      }
    }
  }
}

processDirectory('src');
console.log('Translation complete.');
