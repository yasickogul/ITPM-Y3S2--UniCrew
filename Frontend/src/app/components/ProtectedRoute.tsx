import { Navigate, useLocation, Outlet } from "react-router";
import { useAuthStore, UserRole } from "../stores/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const location = useLocation();

  // Don't retry auth check - let AuthInitializer handle it once

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    const redirectPath =
      user.role === "system_admin" ? "/system-admin" :
      user.role === "university_admin" ? "/university-admin" :
      "/dashboard";

    // Log unauthorized access attempt for debugging
    console.warn(`Unauthorized access: User role '${user.role}' attempted to access restricted area requiring ${allowedRoles.join(', ')}`);

    return <Navigate to={redirectPath} replace />;
  }

  // Use Outlet for nested routes, children for wrapper usage
  return children ? <>{children}</> : <Outlet />;
}

export function GuestRoute() {
  const { isAuthenticated, isLoading } = useAuthStore();

  // Don't retry auth check - let AuthInitializer handle it once

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    const user = useAuthStore.getState().user;
    const redirectPath =
      user?.role === "system_admin" ? "/system-admin" :
      user?.role === "university_admin" ? "/university-admin" :
      "/dashboard";
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
}
