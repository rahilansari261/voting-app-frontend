import { useUserStore } from '@/store/userStore';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const { user, isAuthenticated, login, logout, updateUser } = useUserStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return {
    user,
    isAuthenticated,
    login,
    logout: handleLogout,
    updateUser,
  };
}
