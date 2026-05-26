import { useAuthStore } from '@/store/authStore'

export function useAuth() {
  const store = useAuthStore()

  return {
    ...store,
    isClient: () => store.user?.role === 'CLIENT',
    isExpert: () => store.user?.role === 'EXPERT',
    isAdmin:  () => store.user?.role === 'ADMIN',
    hasRole:  (role: string) => store.user?.role === role,
  }
}
