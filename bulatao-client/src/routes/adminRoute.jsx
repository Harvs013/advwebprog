import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const AdminRoute = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/auth/signin" state={{ from: location.pathname }} replace />;
  }
  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;