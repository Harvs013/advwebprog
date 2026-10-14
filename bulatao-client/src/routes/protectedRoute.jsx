import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';

// Any logged-in user (buyer, seller, or admin) can pass.
const ProtectedRoute = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/auth/signin" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;