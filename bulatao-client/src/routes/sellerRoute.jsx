import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const SellerRoute = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/auth/signin" state={{ from: location.pathname }} replace />;
  }
  if (user.role !== 'seller') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default SellerRoute;