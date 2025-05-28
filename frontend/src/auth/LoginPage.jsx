// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from './useAuth'; // Import the hook
import { ArrowPathIcon, UserCircleIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Header from '../components/Header';


const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth(); // Get login function and auth state

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // Local loading for form submission
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(email, password); // Use the login function from context

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.error || 'Login failed. Please check your credentials.');
    }
    setLoading(false);
  };

  // ... rest of your LoginPage JSX (form, inputs, etc.) ...
  // The JSX from your previous LoginPage.jsx can be used here.
  // Just make sure the form's onSubmit calls this new handleSubmit.
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-sky-100 flex flex-col items-center justify-center p-4 sm:p-6">
      <Header />
      <div className="bg-white shadow-2xl rounded-xl p-8 sm:p-12 max-w-md w-full">
        <div className="text-center mb-8">
          <UserCircleIcon className="mx-auto h-16 w-16 text-indigo-500 mb-4" />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">
            Welcome Back!
          </h1>
          <p className="text-gray-600 mt-2">Sign in to continue.</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow"
              placeholder="you@example.com" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow"
                placeholder="••••••••" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 hover:text-gray-700"
                aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
              <label htmlFor="remember-me" className="ml-2 block text-gray-900">Remember me</label>
            </div>
            <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">Forgot your password?</a>
          </div>
          <div>
            <button type="submit" disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-150 ease-in-out">
              {loading ? (<><ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />Signing In...</>) : ('Sign In')}
            </button>
          </div>
        </form>
        <div className="mt-8 text-center text-sm">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <button onClick={() => navigate('/signup')} className="font-medium text-indigo-600 hover:text-indigo-500">Sign Up</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;