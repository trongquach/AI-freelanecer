import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { useEffect } from 'react'

import { useAuthStore } from '@/store/authStore'
import ProtectedRoute from '@/components/ProtectedRoute'
import MainLayout from '@/components/layout/MainLayout'

// Pages
import LandingPage        from '@/pages/LandingPage'
import LoginPage          from '@/pages/auth/LoginPage'
import RegisterPage       from '@/pages/auth/RegisterPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import JobsPage           from '@/pages/jobs/JobsPage'
import MarketplacePage    from '@/pages/marketplace/MarketplacePage'

// Lazy-loaded pages
import { lazy, Suspense } from 'react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const ClientDashboard  = lazy(() => import('@/pages/dashboard/ClientDashboard'))
const ExpertDashboard  = lazy(() => import('@/pages/dashboard/ExpertDashboard'))
const AdminDashboard   = lazy(() => import('@/pages/dashboard/AdminDashboard'))
const JobDetailPage    = lazy(() => import('@/pages/jobs/JobDetailPage'))
const CreateJobPage    = lazy(() => import('@/pages/jobs/CreateJobPage'))
const ServiceDetailPage= lazy(() => import('@/pages/marketplace/ServiceDetailPage'))
const ContractPage     = lazy(() => import('@/pages/contracts/ContractPage'))
const WalletPage       = lazy(() => import('@/pages/wallet/WalletPage'))
const ProfilePage      = lazy(() => import('@/pages/profile/ProfilePage'))
const NotFoundPage     = lazy(() => import('@/pages/NotFoundPage'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60,      // 1 minute
      gcTime:    1000 * 60 * 5,  // 5 minutes
    },
  },
})

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950">
      <LoadingSpinner size="lg" />
    </div>
  )
}

export default function App() {
  const initializeAuth = useAuthStore(s => s.initializeAuth)

  useEffect(() => {
    initializeAuth()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster richColors position="top-right" />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes */}
            <Route path="/"                  element={<LandingPage />} />
            <Route path="/login"             element={<LoginPage />} />
            <Route path="/register"          element={<RegisterPage />} />
            <Route path="/forgot-password"   element={<ForgotPasswordPage />} />

            {/* Public with layout */}
            <Route element={<MainLayout />}>
              <Route path="/jobs"            element={<JobsPage />} />
              <Route path="/jobs/:id"        element={<JobDetailPage />} />
              <Route path="/marketplace"     element={<MarketplacePage />} />
              <Route path="/marketplace/:id" element={<ServiceDetailPage />} />
            </Route>

            {/* Authenticated — any role */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/profile"               element={<ProfilePage />} />
                <Route path="/wallet"                element={<WalletPage />} />
                <Route path="/contracts/:id"         element={<ContractPage />} />
              </Route>
            </Route>

            {/* CLIENT only */}
            <Route element={<ProtectedRoute allowedRoles={['CLIENT']} />}>
              <Route element={<MainLayout />}>
                <Route path="/dashboard/client"      element={<ClientDashboard />} />
                <Route path="/jobs/new"              element={<CreateJobPage />} />
              </Route>
            </Route>

            {/* EXPERT only */}
            <Route element={<ProtectedRoute allowedRoles={['EXPERT']} />}>
              <Route element={<MainLayout />}>
                <Route path="/dashboard/expert"      element={<ExpertDashboard />} />
              </Route>
            </Route>

            {/* ADMIN only */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route element={<MainLayout />}>
                <Route path="/admin/dashboard"       element={<AdminDashboard />} />
              </Route>
            </Route>

            {/* Fallbacks */}
            <Route path="/403" element={<div className="min-h-screen flex items-center justify-center text-white text-2xl">403 — Không có quyền truy cập</div>} />
            <Route path="*"    element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
