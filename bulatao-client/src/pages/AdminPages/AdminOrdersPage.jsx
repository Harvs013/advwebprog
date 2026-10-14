import { useEffect, useState } from 'react';
import orderService from '../../services/orderService.js';

const statusOptions = ['pending', 'confirmed', 'ready_for_pickup', 'completed', 'cancelled'];

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrders = () => {
    setLoading(true);
    orderService.getAll().then(setOrders).catch((err) => setError(err.message)).finally(() => setLoading(false));
  };

  useEffect(() => {
    const timeoutId = setTimeout(loadOrders, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  const handleStatusChange = async (id, orderStatus) => {
    try {
      await orderService.updateStatus(id, { orderStatus });
      loadOrders();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-zinc-900">Orders</h1>
      {error && <p className="text-sm text-red-500">{error}</p>}

      {loading ? (
        <p className="text-sm text-zinc-600">Loading orders…</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border-2 border-zinc-900 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b-2 border-zinc-900 bg-zinc-100">
              <tr>
                <th className="p-3">Order</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b border-zinc-200">
                  <td className="p-3">#{order._id.slice(-6).toUpperCase()}</td>
                  <td className="p-3">{order.user?.firstName} {order.user?.lastName}</td>
                  <td className="p-3">₱{order.totalAmount}</td>
                  <td className="p-3">
                    <select
                      value={order.orderStatus}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className="rounded-lg border border-zinc-300 px-2 py-1 text-sm"
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
