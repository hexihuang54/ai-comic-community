import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { message } from 'antd';

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { isLoggedIn, isAdmin } = useAuthStore();

  if (!isLoggedIn) {
    message.warning('请先登录');
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    message.error('仅管理员可访问此页面');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
