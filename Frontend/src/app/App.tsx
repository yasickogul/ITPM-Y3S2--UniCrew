import { RouterProvider } from 'react-router';
import { useEffect } from 'react';
import { router } from './routes.tsx';
import { Toaster } from './components/ui/sonner';
import { useAuthStore } from './stores/authStore';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}
export default function App() {
  return (
    <AuthInitializer>
      <RouterProvider router={router} />
      <Toaster />
    </AuthInitializer>
  );
}
