import { Link } from 'react-router-dom'
import { Sparkles, ArrowRight, Star, Users, Briefcase, Zap } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'

const stats = [
  { label: 'AI Experts', value: '2,500+', icon: Users },
  { label: 'Completed Projects', value: '18,000+', icon: Briefcase },
  { label: 'Average Reviews', value: '4.9★', icon: Star },
]

const features = [
  { icon: Zap, title: 'AI Job Assistant', desc: 'Automatically optimize project descriptions and match with the best experts using AI.' },
  { icon: Star, title: 'Verified Experts', desc: 'All experts go through a rigorous skill verification process.' },
  { icon: Briefcase, title: 'Secure Payments', desc: 'Escrow protects both clients and experts in every transaction.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-6 bg-white border-b border-slate-200">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-200/40 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl" />
        </div>
        <div className="relative container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 rounded-full px-4 py-1.5 mb-8 shadow-sm">
            <Sparkles className="w-4 h-4 text-primary-600" />
            <span className="text-sm text-primary-700 font-medium">#1 AI Freelance Platform</span>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight mb-6">
            Connect with top<br />
            <span className="text-gradient">AI Experts</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
            Search and hire AI, Machine Learning, and Data Science experts for your project. Faster and smarter with AI matching.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary btn-xl">
              Start Now <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/marketplace" className="btn-secondary btn-xl">
              Browse AI Services
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="container mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-3 gap-8">
            {stats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="text-center">
                <Icon className="w-8 h-8 text-primary-600 mx-auto mb-4 opacity-80" />
                <div className="text-3xl font-bold text-slate-900 mb-1">{value}</div>
                <div className="text-sm text-slate-500 font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Why choose AIMarket?</h2>
            <p className="text-slate-500 text-lg">Built specifically for AI and data projects</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-8 hover:border-primary-200 transition-colors bg-slate-50/50">
                <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center mb-6 shadow-sm">
                  <Icon className="w-7 h-7 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
                <p className="text-slate-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="card p-12 border-primary-200 relative overflow-hidden bg-white shadow-soft-lg">
            <div className="absolute inset-0 bg-primary-50 opacity-50" />
            <h2 className="relative text-4xl font-bold text-slate-900 mb-4">Ready to start?</h2>
            <p className="relative text-slate-600 mb-8 text-lg">Join today and connect with thousands of AI experts worldwide.</p>
            <Link to="/register" className="btn-primary btn-xl relative shadow-md">
              Create Free Account <ArrowRight className="w-5 h-5 ml-1" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 text-center text-slate-500 text-sm bg-white">
        © 2024 AIMarket — AI Freelance Marketplace. All rights reserved.
      </footer>
    </div>
  )
}
