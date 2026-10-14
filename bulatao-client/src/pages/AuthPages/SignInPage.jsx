import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Button from '../../components/Button';
import { useAuth } from '../../context/authContext';

const inputClasses =
  'mt-2 w-full rounded-xl border border-zinc-300 bg-zinc-100 px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-zinc-50';

const actionButtonClassName = 'w-full rounded-xl py-3 text-[11px] tracking-[0.2em]';

const SignInPage = () => {
  const { logIn, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await logIn(formData);
      const redirectTo = location.state?.from ?? '/';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setFormError(err.message || 'Unable to log in. Please try again.');
    }
  };

  return (
    <>

      <h1 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">Log In</h1>
      <p className="mt-3 text-sm leading-6 text-yellow-400">
        Access your store account to review orders, saved items, and pickup details.
      </p>

      {formError && (
        <p className="mt-4 rounded-lg border border-red-400 bg-red-950/40 px-4 py-2 text-sm text-red-200">
          {formError}
        </p>
      )}

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="signin-email" className="text-sm font-medium text-zinc-100">
            Email Address
          </label>
          <input
            id="signin-email"
            name="email"
            type="email"
            placeholder="student@email.com"
            autoComplete="email"
            className={inputClasses}
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="signin-password" className="text-sm font-medium text-zinc-100">
            Password
          </label>
          <input
            id="signin-password"
            name="password"
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            className={inputClasses}
            value={formData.password}
            onChange={handleChange}
            required
          />
          <p className="mt-2 text-xs leading-5 text-yellow-400">
            It must be a combination of minimum 8 letters, numbers, and symbols.
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 text-sm">
          <label className="flex items-center gap-2 text-zinc-600">
            <input type="checkbox" className="h-4 w-4 rounded border-zinc-300 accent-zinc-900" />
            <span className="text-zinc-300">Remember me</span>
          </label>
          <button type="button" className="font-medium text-zinc-100 transition hover:text-yellow-400">
            Forgot Password?
          </button>
        </div>

        <Button type="submit" variant="primary" className={actionButtonClassName} disabled={loading}>
          {loading ? 'Logging In…' : 'Log In'}
        </Button>

        <div className="grid gap-3 pt-2 sm:grid-cols-2">
          <Button type="button" variant="secondary" className={actionButtonClassName}>
            Log In with Google
          </Button>
          <Button type="button" variant="secondary" className={actionButtonClassName}>
            Log In with Apple
          </Button>
        </div>
      </form>

      <div className="mt-8 border-t border-zinc-200 pt-6 text-sm text-yellow-400">
        No account yet?{' '}
        <Link to="/auth/signup" className="font-semibold text-zinc-100 transition hover:text-yellow-300">
          Sign Up
        </Link>
      </div>
    </>
  );
};

export default SignInPage;