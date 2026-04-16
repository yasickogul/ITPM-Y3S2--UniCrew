import { Navigate, Outlet, useLocation } from 'react-router';
import { UserRole, useAuth } from '../../context/AuthContext';

interface RoleGuardProps {
  allowedRoles: UserRole[];
}

export default function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export function StudentGuard() {
  return <RoleGuard allowedRoles={['student']} />;
}

export function UniversityAdminGuard() {
  return <RoleGuard allowedRoles={['university_admin']} />;
}

export function SystemAdminGuard() {
  return <RoleGuard allowedRoles={['system_admin']} />;
}
