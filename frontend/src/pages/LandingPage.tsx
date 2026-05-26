import { Link } from 'react-router-dom'
import { Sparkles, ArrowRight, Star, Users, Briefcase, Zap } from 'lucide-react'

const stats = [
  { label: 'Chuyên gia AI', value: '2,500+', icon: Users },
  { label: 'Dự án hoàn thành', value: '18,000+', icon: Briefcase },
  { label: 'Đánh giá trung bình', value: '4.9★', icon: Star },
]

const features = [
  { icon: Zap, title: 'AI Job Assistant', desc: 'Tự động tối ưu mô tả dự án và gợi ý chuyên gia phù hợp với AI.' },
  { icon: Star, title: 'Chuyên gia được kiểm duyệt', desc: 'Tất cả chuyên gia qua quy trình xác minh kỹ năng nghiêm ngặt.' },
  { icon: Briefcase, title: 'Thanh toán bảo mật', desc: 'Escrow bảo vệ cả khách hàng và chuyên gia trong mọi giao dịch.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-950">
      {/* Navbar */}
      <nav className="border-b border-surface-800 bg-surface-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">AIMarket</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/jobs" className="text-slate-400 hover:text-white text-sm">Tìm việc</Link>
            <Link to="/marketplace" className="text-slate-400 hover:text-white text-sm">Marketplace</Link>
            <Link to="/login" className="btn-ghost btn-sm">Đăng nhập</Link>
            <Link to="/register" className="btn-gradient btn-sm">Bắt đầu miễn phí</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-6">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent-600/10 rounded-full blur-3xl" />
        </div>
        <div className="relative container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 rounded-full px-4 py-1.5 mb-8">
            <Sparkles className="w-4 h-4 text-primary-400" />
            <span className="text-sm text-primary-300 font-medium">Nền tảng AI Freelance #1 Việt Nam</span>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
            Kết nối với<br />
            <span className="text-gradient">chuyên gia AI</span><br />
            hàng đầu
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            Tìm kiếm và thuê các chuyên gia AI, Machine Learning, và Data Science cho dự án của bạn. Nhanh hơn, thông minh hơn với AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-gradient btn-xl">
              Bắt đầu ngay <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/marketplace" className="btn-secondary btn-xl">
              Xem dịch vụ AI
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-surface-800">
        <div className="container mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-3 gap-8">
            {stats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="text-center">
                <Icon className="w-7 h-7 text-primary-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">{value}</div>
                <div className="text-sm text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Tại sao chọn AIMarket?</h2>
            <p className="text-slate-400 text-lg">Được xây dựng đặc biệt cho các dự án AI</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-8 hover:border-primary-700 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                <p className="text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="card p-12 border-primary-800 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-primary opacity-5" />
            <h2 className="relative text-4xl font-bold text-white mb-4">Sẵn sàng bắt đầu?</h2>
            <p className="relative text-slate-400 mb-8 text-lg">Tham gia ngay hôm nay và kết nối với hàng nghìn chuyên gia AI.</p>
            <Link to="/register" className="btn-gradient btn-xl relative">
              Tạo tài khoản miễn phí <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-surface-800 py-8 text-center text-slate-600 text-sm">
        © 2024 AIMarket — AI Freelance Marketplace. All rights reserved.
      </footer>
    </div>
  )
}
