import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/authContext';
import ProtectedRoute from './routes/protectedRoute';
import AdminRoute from './routes/adminRoute';
import SellerRoute from './routes/sellerRoute';

// HomePage Structure
import Layout from './layouts/Layout';
import ProductPage from './pages/LandingPages/ProductPage';
import HomePage from './pages/LandingPages/HomePage';
import AboutPage from './pages/LandingPages/AboutPage';
import ProductListPage from './pages/LandingPages/ProductListPage';

// Customer account pages
import CartPage from './pages/CustomerPages/CartPage';
import CheckoutPage from './pages/CustomerPages/CheckOutPage';
import OrdersPage from './pages/CustomerPages/OrdersPage';
import ProfilePage from './pages/CustomerPages/ProfilePage';

// Seller pages
import SellerProductsPage from './pages/SellerPages/SellerProductPage';

// Auth Pages Structure
import AuthLayout from './layouts/AuthLayout';
import SignInPage from './pages/AuthPages/SignInPage';
import SignUpPage from './pages/AuthPages/SignUpPage';

// Admin pages
import AdminLayout from './layouts/AdminLayout';
import AdminProductsPage from './pages/AdminPages/AdminProductsPage';
import AdminOrdersPage from './pages/AdminPages/AdminOrdersPage';
import AdminReviewsPage from './pages/AdminPages/AdminReviewsPage';
import AdminUsersPage from './pages/AdminPages/AdminUsersPage';

import NotFoundPage from './pages/NotFoundPage';

const routes = [
  {
    path: '/',
    element: <Layout />,
    errorElement: <NotFoundPage />,
    children: [
      { path: '', element: <HomePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'products', element: <ProductListPage /> },
      { path: 'products/:id', element: <ProductPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'cart', element: <CartPage /> },
          { path: 'checkout', element: <CheckoutPage /> },
          { path: 'orders', element: <OrdersPage /> },
          { path: 'profile', element: <ProfilePage /> },
        ],
      },
      {
        element: <SellerRoute />,
        children: [{ path: 'seller/products', element: <SellerProductsPage /> }],
      },
    ],
  },
  {
    path: 'auth/',
    element: <AuthLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { path: 'signin', element: <SignInPage /> },
      { path: 'signup', element: <SignUpPage /> },
    ],
  },
  {
    path: 'admin',
    element: <AdminRoute />,
    errorElement: <NotFoundPage />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: '', element: <AdminProductsPage /> },
          { path: 'products', element: <AdminProductsPage /> },
          { path: 'orders', element: <AdminOrdersPage /> },
          { path: 'reviews', element: <AdminReviewsPage /> },
          { path: 'users', element: <AdminUsersPage /> },
        ],
      },
    ],
  },
];

const router = createBrowserRouter(routes);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;