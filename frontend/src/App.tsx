import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'

import { useAuthStore } from '@/store/authStore'
import ProtectedRoute from '@/components/ProtectedRoute'
import MainLayout from '@/components/layout/MainLayout'
import { useRealtimeEvents } from '@/hooks/useRealtimeEvents'

// Pages
import LandingPage        from '@/pages/LandingPage'
import LoginPage          from '@/pages/auth/LoginPage'
import RegisterPage       from '@/pages/auth/RegisterPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import JobsPage           from '@/pages/jobs/JobsPage'
import MarketplacePage    from '@/pages/marketplace/MarketplacePage'
import MyJobsPage         from '@/pages/jobs/MyJobsPage'

// Lazy-loaded pages
import { lazy, Suspense } from 'react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const ClientDashboard  = lazy(() => import('@/pages/dashboard/ClientDashboard'))
const ExpertDashboard  = lazy(() => import('@/pages/dashboard/ExpertDashboard'))
const AdminDashboard   = lazy(() => import('@/pages/dashboard/AdminDashboard'))
const UsersPage        = lazy(() => import('@/pages/dashboard/admin/UsersPage'))
const ServiceModerationPage = lazy(() => import('@/pages/dashboard/admin/ServiceModerationPage'))
const JobsModerationPage    = lazy(() => import('@/pages/dashboard/admin/JobsModerationPage'))
const TransactionsPage      = lazy(() => import('@/pages/dashboard/admin/TransactionsPage'))
const DisputesPage          = lazy(() => import('@/pages/dashboard/admin/DisputesPage'))
const WithdrawalsPage       = lazy(() => import('@/pages/dashboard/admin/WithdrawalsPage'))
const EscrowManagementPage  = lazy(() => import('@/pages/dashboard/admin/EscrowManagementPage'))
const JobDetailPage    = lazy(() => import('@/pages/jobs/JobDetailPage'))
const CreateJobPage    = lazy(() => import('@/pages/jobs/CreateJobPage'))
const EditJobPage      = lazy(() => import('@/pages/jobs/EditJobPage'))
const ProposalListPage = lazy(() => import('@/pages/proposals/ProposalListPage'))
const ProposalFormPage = lazy(() => import('@/pages/proposals/ProposalFormPage'))
const ServiceDetailPage= lazy(() => import('@/pages/marketplace/ServiceDetailPage'))
const CreateServicePage= lazy(() => import('@/pages/marketplace/CreateServicePage'))
const EditServicePage  = lazy(() => import('@/pages/marketplace/EditServicePage'))
const MyServicesPage   = lazy(() => import('@/pages/marketplace/MyServicesPage'))
const ContractPage     = lazy(() => import('@/pages/contracts/ContractPage'))
const WalletPage       = lazy(() => import('@/pages/wallet/WalletPage'))
const ProfilePage      = lazy(() => import('@/pages/profile/ProfilePage'))
const ExpertCVPage     = lazy(() => import('@/pages/profile/ExpertCVPage'))
const PublicProfilePage= lazy(() => import('@/pages/profile/PublicProfilePage'))
const PublicExpertCVPage = lazy(() => import('@/pages/profile/PublicExpertCVPage'))
const NotificationsPage= lazy(() => import('@/pages/notifications/NotificationsPage'))
const NotFoundPage     = lazy(() => import('@/pages/NotFoundPage'))
const AccessDeniedPage = lazy(() => import('@/pages/AccessDeniedPage'))


function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <LoadingSpinner size="lg" />
    </div>
  )
}

export default function App() {
  const initializeAuth = useAuthStore(s => s.initializeAuth)

  useEffect(() => {
    initializeAuth()
  }, [])

  // Mount global real-time event handler (WebSocket → React Query cache invalidation)
  useRealtimeEvents()

  return (
    <>
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
              <Route path="/profile/:id"     element={<PublicProfilePage />} />
              <Route path="/cv/expert/:id"   element={<PublicExpertCVPage />} />
            </Route>

            {/* Authenticated — any role */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/profile"               element={<ProfilePage />} />
                <Route path="/wallet"                element={<WalletPage />} />
                <Route path="/contracts/:id"         element={<ContractPage />} />
                <Route path="/notifications"         element={<NotificationsPage />} />
              </Route>
            </Route>

            {/* CLIENT only */}
            <Route element={<ProtectedRoute allowedRoles={['CLIENT']} />}>
              <Route element={<MainLayout />}>
                <Route path="/dashboard/client"      element={<ClientDashboard />} />
                <Route path="/jobs/my"                element={<MyJobsPage />} />
                <Route path="/jobs/new"              element={<CreateJobPage />} />
                <Route path="/jobs/:id/edit"         element={<EditJobPage />} />
                <Route path="/jobs/:id/proposals"    element={<ProposalListPage />} />
              </Route>
            </Route>

            {/* EXPERT only */}
            <Route element={<ProtectedRoute allowedRoles={['EXPERT']} />}>
              <Route element={<MainLayout />}>
                <Route path="/dashboard/expert"      element={<ExpertDashboard />} />
                <Route path="/services/my"            element={<MyServicesPage />} />
                <Route path="/cv"                    element={<ExpertCVPage />} />
                <Route path="/jobs/:id/proposals/new" element={<ProposalFormPage />} />
                <Route path="/services/new"          element={<CreateServicePage />} />
                <Route path="/services/:id/edit"     element={<EditServicePage />} />
              </Route>
            </Route>

            {/* ADMIN only */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route element={<MainLayout />}>
                <Route path="/admin/dashboard"       element={<AdminDashboard />} />
                <Route path="/admin/users"           element={<UsersPage />} />
                <Route path="/admin/services"        element={<ServiceModerationPage />} />
                <Route path="/admin/jobs"            element={<JobsModerationPage />} />
                <Route path="/admin/transactions"    element={<TransactionsPage />} />
                <Route path="/admin/disputes"        element={<DisputesPage />} />
                <Route path="/admin/withdrawals"     element={<WithdrawalsPage />} />
                <Route path="/admin/escrow"          element={<EscrowManagementPage />} />
              </Route>
            </Route>

            {/* Fallbacks */}
            <Route path="/403" element={<AccessDeniedPage />} />
            <Route path="*"    element={<NotFoundPage />} />
          </Routes>
        </Suspense>
    </>
  )
}
