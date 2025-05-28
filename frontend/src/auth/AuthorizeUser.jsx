
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LockClosedIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'; // Or any other icon you prefer
import Header from '../components/Header';

const AuthorizeUser = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // The path the user was trying to access before being redirected here.
  // This is typically set by your ProtectedRoute component in the `state` of the Navigate component.
  const from = location.state?.from?.pathname || '/'; // Default to homepage if 'from' is not set

  const handleLoginRedirect = () => {
    // Redirect to the login page, passing along the 'from' path
    // so the login page can redirect back after successful login.
    navigate('/login', { state: { from: from } });
  };

  const handleGoHome = () => {
    navigate('/'); // Or your designated home/dashboard path
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-sky-100 flex flex-col items-center justify-center p-4 sm:p-6">
      <Header />
      <div className="bg-white shadow-2xl rounded-xl p-8 sm:p-12 max-w-md w-full text-center">
        <LockClosedIcon className="mx-auto h-16 w-16 text-indigo-500 mb-6" />

        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-4">
          Authorization Required
        </h1>

        <p className="text-gray-600 text-base sm:text-lg mb-8">
          You need to be logged in to access this page or resource. Please log in to continue.
        </p>

        <button
          onClick={handleLoginRedirect}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Proceed to Login
        </button>

        <div className="mt-8">
          <button
            onClick={handleGoHome}
            className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium group"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1.5 transition-transform duration-150 ease-in-out group-hover:-translate-x-0.5" />
            Go back to Homepage
          </button>
        </div>
      </div>

      <footer className="mt-10 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} Your App Name. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AuthorizeUser;