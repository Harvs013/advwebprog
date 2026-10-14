import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button.jsx';
import cartService from '../../services/cartService.js';
import { useAuth } from '../../context/authContext';

const CartPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCart = () => {
    setLoading(true);
    cartService
      .getByUser(user._id)
      .then(setCart)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRemove = async (productId) => {
    try {
      const updated = await cartService.removeItem(user._id, productId);
      setCart(updated);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClear = async () => {
    try {
      const updated = await cartService.clear(user._id);
      setCart(updated);
    } catch (err) {
      setError(err.message);
    }
  };

  const items = cart?.items ?? [];

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="border-y-2 border-zinc-900 bg-blue-950 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-yellow-500">Cart</p>
        <h1 className="text-3xl font-bold leading-tight text-zinc-100 sm:text-4xl">Your Cart</h1>
        <div className="mt-6">
          <Button to="/products">Continue Shopping</Button>
        </div>
      </section>

      <section className="border-y-2 border-zinc-900 bg-blue-950 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {loading && <p className="text-sm text-zinc-300">Loading your cart…</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}

        {!loading && items.length === 0 && (
          <div className="mx-auto max-w-3xl rounded-3xl border-2 border-zinc-900 bg-yellow-400 p-8 text-center">
            <p className="font-semibold text-zinc-900">Your cart is empty.</p>
            <Button to="/products" variant="primary" className="mt-4">Browse Products</Button>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="mx-auto max-w-3xl space-y-4">
            <ul className="space-y-4">
              {items.map((item, index) => (
                <li
                  key={item.product?._id || item._id || `cart-item-${index}`}
                  className="flex items-center justify-between gap-4 rounded-3xl border-2 border-zinc-900 bg-zinc-100 p-4"
                >
                  <div>
                    <p className="font-semibold text-zinc-900">{item.product?.productName}</p>
                    <p className="text-sm text-zinc-600">₱{item.price} × {item.quantity}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(item.product?._id)}
                    className="rounded-full border-2 border-zinc-900 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-900 transition hover:bg-zinc-900 hover:text-zinc-50"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border-2 border-zinc-900 bg-yellow-400 p-4">
              <p className="text-lg font-bold text-zinc-900">Total: ₱{cart.totalPrice}</p>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={handleClear}>Clear Cart</Button>
                <Button variant="primary" onClick={() => navigate('/checkout')}>Checkout</Button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default CartPage;