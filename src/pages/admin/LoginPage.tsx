import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { Navigate } from 'react-router-dom';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormData = z.infer<typeof schema>;

export default function AdminLoginPage() {
  const { login, isAuthenticated, isLoggingIn, loginError } = useAuth();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  if (isAuthenticated) return <Navigate to="/admin/dashboard" replace />;

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      await login(data);
    } catch {
      setError('Invalid email or password');
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Login | Smartcut</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen bg-primary flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="font-heading text-4xl tracking-widest text-accent">SMARTCUT</div>
            <p className="text-light-muted text-sm mt-2">Admin Login</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="bg-surface p-8 rounded-sm space-y-4">
            <div>
              <label className="block text-sm text-light-muted mb-1">Email</label>
              <input
                {...register('email')}
                type="email"
                className="w-full bg-primary border border-surface rounded-sm px-4 py-3 text-light-text focus:border-accent outline-none"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm text-light-muted mb-1">Password</label>
              <input
                {...register('password')}
                type="password"
                className="w-full bg-primary border border-surface rounded-sm px-4 py-3 text-light-text focus:border-accent outline-none"
              />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>
            {(error || loginError) && (
              <p className="text-red-400 text-sm">{error || 'Login failed'}</p>
            )}
            <button type="submit" disabled={isLoggingIn} className="btn-primary w-full justify-center">
              {isLoggingIn ? 'Signing in...' : 'SIGN IN'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
