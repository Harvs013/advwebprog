import { NavLink, Outlet } from 'react-router-dom';

const linkClass = ({ isActive }) =>
  [
    'block rounded-full border-2 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] transition',
    isActive
      ? 'border-zinc-900 bg-zinc-900 text-zinc-50'
      : 'border-transparent text-zinc-300 hover:border-zinc-900 hover:bg-zinc-50 hover:text-zinc-900',
  ].join(' ');

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-zinc-100 text-zinc-900">
      <aside className="fixed inset-y-0 left-0 w-60 shrink-0 overflow-y-auto border-r-2 border-zinc-900 bg-blue-950 p-4">
        <p className="mb-6 text-lg font-bold text-yellow-500">BulldogEx Admin</p>
        <nav className="space-y-2">
          <NavLink to="/admin/products" className={linkClass}>Products</NavLink>
          <NavLink to="/admin/orders" className={linkClass}>Orders</NavLink>
          <NavLink to="/admin/reviews" className={linkClass}>Reviews</NavLink>
          <NavLink to="/admin/users" className={linkClass}>Users</NavLink>
          <NavLink to="/" className={linkClass}>Back to Home</NavLink>
        </nav>
      </aside>
      <main className="ml-60 flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;