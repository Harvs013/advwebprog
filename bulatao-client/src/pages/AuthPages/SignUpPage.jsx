import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import { useAuth } from '../../context/authContext';

const inputClasses =
  'mt-2 w-full rounded-xl border border-zinc-300 bg-zinc-100 px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-zinc-50';

const actionButtonClassName = 'w-full rounded-xl py-3 text-[11px] tracking-[0.2em]';

const SignUpPage = () => {
  const { signUp, loading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'buyer',
  });
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await signUp(formData);
      navigate('/', { replace: true });
    } catch (err) {
      setFormError(err.message || 'Unable to create your account. Please try again.');
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">Sign Up</h1>
      <p className="mt-3 text-sm leading-6 text-yellow-400">
        Create a store account for faster checkout, order updates, and pickup details.
      </p>

      {formError && (
        <p className="mt-4 rounded-lg border border-red-400 bg-red-950/40 px-4 py-2 text-sm text-red-200">
          {formError}
        </p>
      )}

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <div>
          <span className="text-sm font-medium text-zinc-100">I'm signing up as a</span>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <label
              className={`cursor-pointer rounded-xl border-2 px-4 py-3 text-center text-sm font-semibold transition ${
                formData.role === 'buyer'
                  ? 'border-yellow-400 bg-yellow-400/10 text-yellow-300'
                  : 'border-zinc-600 text-zinc-300 hover:border-zinc-400'
              }`}
            >
              <input
                type="radio"
                name="role"
                value="buyer"
                checked={formData.role === 'buyer'}
                onChange={handleChange}
                className="sr-only"
              />
              Buyer
            </label>
            <label
              className={`cursor-pointer rounded-xl border-2 px-4 py-3 text-center text-sm font-semibold transition ${
                formData.role === 'seller'
                  ? 'border-yellow-400 bg-yellow-400/10 text-yellow-300'
                  : 'border-zinc-600 text-zinc-300 hover:border-zinc-400'
              }`}
            >
              <input
                type="radio"
                name="role"
                value="seller"
                checked={formData.role === 'seller'}
                onChange={handleChange}
                className="sr-only"
              />
              Seller
            </label>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="first-name" className="text-sm font-medium text-zinc-100">
              First Name
            </label>
            <input
              id="first-name"
              name="firstName"
              type="text"
              placeholder="First name"
              autoComplete="given-name"
              className={inputClasses}
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="last-name" className="text-sm font-medium text-zinc-100">
              Last Name
            </label>
            <input
              id="last-name"
              name="lastName"
              type="text"
              placeholder="Last name"
              autoComplete="family-name"
              className={inputClasses}
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="signup-email" className="text-sm font-medium text-zinc-100">
            Email
          </label>
          <input
            id="signup-email"
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
          <label htmlFor="signup-password" className="text-sm font-medium text-zinc-100">
            Password
          </label>
          <input
            id="signup-password"
            name="password"
            type="password"
            placeholder="Password"
            autoComplete="new-password"
            className={inputClasses}
            value={formData.password}
            onChange={handleChange}
            minLength={6}
            required
          />
          <p className="mt-2 text-xs leading-5 text-yellow-400">
            Use a secure password with letters, numbers, and symbols.
          </p>
        </div>

        <Button type="submit" variant="primary" className={actionButtonClassName} disabled={loading}>
          {loading ? 'Creating Account…' : 'Create Account'}
        </Button>
      </form>

      <div className="mt-8 border-t border-zinc-200 pt-6 text-sm text-zinc-100">
        Already have an account?{' '}
        <Link to="/auth/signin" className="font-semibold text-zinc-300 transition hover:text-yellow-300">
          Log In
        </Link>
      </div>
    </>
  );
};

export default SignUpPage;