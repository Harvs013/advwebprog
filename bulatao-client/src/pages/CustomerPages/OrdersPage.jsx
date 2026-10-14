import { useEffect, useState } from 'react';
import Button from '../../components/Button.jsx';
import orderService from '../../services/orderService.js';
import { useAuth } from '../../context/authContext';

const statusLabels = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  ready_for_pickup: 'Ready for Claiming',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const OrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    orderService
      .getByUser(user._id)
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="border-y-2 border-zinc-900 bg-blue-950 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-yellow-500">Orders</p>
        <h1 className="text-3xl font-bold leading-tight text-zinc-100 sm:text-4xl">My Orders</h1>
        <div className="mt-6">
          <Button to="/products">Continue Shopping</Button>
        </div>
      </section>

      <section className="border-y-2 border-zinc-900 bg-blue-950 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {loading && <p className="text-sm text-zinc-300">Loading orders…</p>}
          {error && <p className="text-sm text-red-400">{error}</p>}
          {!loading && !error && orders.length === 0 && (
            <p className="text-sm text-zinc-300">You haven't placed any orders yet.</p>
          )}

          <ul className="space-y-4">
            {orders.map((order) => (
              <li key={order._id} className="rounded-3xl border-2 border-zinc-900 bg-zinc-100 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-zinc-900">
                    Order #{order._id.slice(-6).toUpperCase()}
                  </p>
                  <span className="rounded-full border-2 border-zinc-900 bg-yellow-400 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-900">
                    {statusLabels[order.orderStatus] || order.orderStatus}
                  </span>
                </div>
                <ul className="mt-3 space-y-1 text-sm text-zinc-700">
                  {order.items.map((item, idx) => (
                    <li key={idx}>
                      {item.product?.productName} × {item.quantity} — ₱{item.price * item.quantity}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-sm font-bold text-zinc-900">Total: ₱{order.totalAmount}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
};

export default OrdersPage;