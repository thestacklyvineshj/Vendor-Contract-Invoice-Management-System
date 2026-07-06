import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { APP_NAME } from '../../utils/constants';
import ErrorAlert from '../../components/ErrorAlert';
import LoadingSpinner from '../../components/LoadingSpinner';

const Login = () => {
  const { login, getDashboardRoute } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      const user = await login(data);
      const routes = { ADMIN: '/admin', FINANCE_MANAGER: '/finance', VENDOR: '/vendor' };
      navigate(routes[user.role] || getDashboardRoute());
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 bg-brand-900 text-white flex-col justify-center px-12">
        <div className="max-w-md">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-brand-600 text-xl font-bold">
            VCIMS
          </div>
          <h1 className="text-3xl font-bold leading-tight">{APP_NAME}</h1>
          <p className="mt-4 text-brand-200">
            Streamline vendor contracts, invoice approvals, and payment tracking in one enterprise platform.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-brand-100">
            <li className="flex items-center gap-2"><span className="text-brand-400">✓</span> Role-based access control</li>
            <li className="flex items-center gap-2"><span className="text-brand-400">✓</span> Invoice approval workflows</li>
            <li className="flex items-center gap-2"><span className="text-brand-400">✓</span> Payment analytics dashboard</li>
          </ul>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden text-center">
            <h1 className="text-2xl font-bold text-brand-900">{APP_NAME}</h1>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Sign in to your account</h2>
            <p className="mt-1 text-sm text-slate-500">Enter your credentials to access the portal</p>

            {error && <div className="mt-4"><ErrorAlert message={error} onClose={() => setError('')} /></div>}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  {...register('email', { required: 'Email is required' })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  placeholder="you@company.com"
                />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <input
                  type="password"
                  {...register('password', { required: 'Password is required' })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  placeholder="••••••••"
                />
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
              >
                {loading && <LoadingSpinner size="sm" className="border-white/30 border-t-white" />}
                Sign In
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="font-medium text-brand-600 hover:text-brand-700">Register as Vendor</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
