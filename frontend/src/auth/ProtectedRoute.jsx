// import React from 'react';
// import { Navigate, useLocation, Outlet } from 'react-router-dom';

// // Assume useAuth is a custom hook that returns { isAuthenticated: boolean, user: object | null }
// // const { isAuthenticated } = useAuth(); // Replace with your actual auth checking logic

// const ProtectedRoute = ({ allowedRoles }) => { // Example: Role-based access
//   const location = useLocation();
//   const isAuthenticated = !!localStorage.getItem('authToken'); // Replace with your actual auth check
//   // const userRole = localStorage.getItem('userRole'); // Example for role check

//   if (!isAuthenticated) {
//     // Redirect them to the /authorize page, but save the current location they were
//     // trying to go to. This allows us to send them along to that page after they login,
//     // which is a common UX pattern.
//     return <Navigate to="/auth" state={{ from: location }} replace />;
//   }

//   // Optional: Role-based check
//   // if (allowedRoles && !allowedRoles.includes(userRole)) {
//   //   return <Navigate to="/unauthorized-role" state={{ from: location }} replace />; // Or a specific "role unauthorized" page
//   // }

//   return <Outlet />; // Or `children` if you pass components as children
// };

// export default ProtectedRoute;

// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import useAuth from './useAuth';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Show a loading spinner or a blank page while checking auth status
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    // Redirect them to the /authorize page (or /login directly),
    // saving the current location they were trying to go to.
    return <Navigate to="/auth" state={{ from: location }} replace />;
    // Or directly to login:
    // return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />; // If authenticated, render the child routes
};

export default ProtectedRoute;