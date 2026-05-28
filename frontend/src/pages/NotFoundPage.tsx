import { Link } from 'react-router-dom'
import { Home, SearchX } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="text-8xl font-black text-gradient mb-4">404</div>
        <SearchX className="w-16 h-16 text-slate-600 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Page Not Found</h1>
        <p className="text-slate-400 mb-8">The page you are looking for has been removed or does not exist.</p>
        <Link to="/" className="btn-gradient btn-lg">
          <Home className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    </div>
  )
}
