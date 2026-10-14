import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button.jsx';
import cartService from '../../services/cartService.js';
import orderService from '../../services/orderService.js';
import { useAuth } from '../../context/authContext';

const inputClasses =
  'mt-2 w-full rounded-xl border border-zinc-300 bg-zinc-100 px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-zinc-50';

const CheckoutPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ shippingAddress: user?.address || '', paymentMethod: 'cod' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    cartService
      .getByUser(user._id)
      .then(setCart)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!cart || cart.items.length === 0) {
      setError('Your cart is empty.');
      return;
    }
    setSubmitting(true);
    try {
      await orderService.create({
        items: cart.items.map((i) => ({
          product: i.product._id,
          quantity: i.quantity,
          price: i.price,
        })),
        totalAmount: cart.totalPrice,
        shippingAddress: form.shippingAddress,
        paymentMethod: form.paymentMethod,
      });
      await cartService.clear(user._id);
      navigate('/orders', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="border-y-2 border-zinc-900 bg-blue-900 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-yellow-500">Checkout</p>
        <h1 className="text-3xl font-bold leading-tight text-zinc-50 sm:text-4xl">Confirm your order</h1>
      </section>

      <section className="border-y-2 border-zinc-900 bg-blue-900 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-2xl">
          {loading ? (
            <p className="text-sm text-zinc-300">Loading checkout…</p>
          ) : (
            <>
              {cart && (
                <div className="rounded-3xl border-2 border-zinc-900 bg-zinc-100 p-4">
                  <p className="font-semibold text-zinc-900">Order Summary</p>
                  <ul className="mt-2 space-y-1 text-sm text-zinc-700">
                    {cart.items.map((i) => (
                      <li key={i.product?._id}>
                        {i.product?.productName} × {i.quantity} — ₱{i.price * i.quantity}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 font-bold text-zinc-900">Total: ₱{cart.totalPrice}</p>
                </div>
              )}

              {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div>
                  <label htmlFor="shippingAddress" className="text-sm font-medium text-zinc-100">
                    Pickup / Shipping Address
                  </label>
                  <input
                    id="shippingAddress"
                    name="shippingAddress"
                    type="text"
                    value={form.shippingAddress}
                    onChange={handleChange}
                    className={inputClasses}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="paymentMethod" className="text-sm font-medium text-zinc-100">
                    Payment Method
                  </label>
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    value={form.paymentMethod}
                    onChange={handleChange}
                    className={inputClasses}
                  >
                    <option value="cod">Cash on Pickup</option>
                    <option value="gcash">GCash</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="paypal">PayPal</option>
                  </select>
                </div>

                <Button type="submit" variant="primary" className="w-full rounded-xl py-3" disabled={submitting}>
                  {submitting ? 'Placing Order…' : 'Place Order'}
                </Button>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default CheckoutPage;