import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 py-6 text-center text-slate-400 text-sm">
        © 2024 AIMarket — AI Freelance Marketplace
      </footer>
    </div>
  )
}
