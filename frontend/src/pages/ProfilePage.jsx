import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../auth/useAuth'; // Your authentication hook
import { UserCircleIcon, EnvelopeIcon, IdentificationIcon, KeyIcon, PencilSquareIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import Header from '../components/Header';
// import axios from 'axios'; // Uncomment if you need to fetch more profile details

const ProfilePage = () => {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();

  // Local state for potential form editing (example)
  // const [isEditing, setIsEditing] = useState(false);
  // const [formData, setFormData] = useState({ name: '', email: '' });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login'); // Redirect to login if not authenticated
    }
    // if (user && !isEditing) { // Populate form if user data available and not currently editing
    //   setFormData({ name: user.name || '', email: user.email || '' });
    // }
  }, [isAuthenticated, authLoading, navigate, user /*, isEditing*/]);


  if (authLoading || !user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-slate-50">
        <p className="text-gray-500 text-lg">Loading profile...</p>
      </div>
    );
  }

  // const handleEditToggle = () => setIsEditing(!isEditing);

  // const handleChange = (e) => {
  //   setFormData({ ...formData, [e.target.name]: e.target.value });
  // };

  // const handleProfileUpdate = async (e) => {
  //   e.preventDefault();
  //   // TODO: API call to update profile
  //   // Example:
  //   // try {
  //   //   const response = await axios.put('/api/user/profile', formData, {
  //   //     headers: { Authorization: `Bearer ${token}` } // Assuming token is accessible via useAuth or directly
  //   //   });
  //   //   // Update user in AuthContext if necessary, or refetch
  //   //   alert('Profile updated successfully!');
  //   //   setIsEditing(false);
  //   // } catch (error) {
  //   //   console.error("Profile update error:", error);
  //   //   alert('Failed to update profile.');
  //   // }
  //   console.log("Update profile with:", formData);
  //   setIsEditing(false); // For now, just log and close edit mode
  // };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : '?');


  return (
    // This container assumes it's rendered within AppLayout's <main className="pt-16">
    // So, padding is for the content inside the profile page area.
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <Header/>
      <header className="mb-10 mt-20 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-800 sm:text-5xl">
          Your Profile
        </h1>
        <p className="mt-3 text-lg text-gray-600">
          Manage your account details and preferences.
        </p>
      </header>

      <div className="bg-white shadow-xl rounded-xl overflow-hidden">
        {/* Profile Header Section */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 sm:p-8 text-white">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="relative">
              <span className="inline-flex items-center justify-center h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-white text-indigo-600 text-3xl sm:text-4xl font-bold ring-4 ring-white ring-opacity-50">
                {userInitial}
              </span>
              {/* Online indicator (optional) */}
              {/* <span className="absolute bottom-1 right-1 block h-5 w-5 rounded-full ring-2 ring-indigo-500 bg-green-400"/> */}
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold">{user.name || 'User'}</h2>
              <p className="text-indigo-200 text-sm sm:text-base">{user.email}</p>
              {/* You might have a role or join date from the user object in JWT */}
              {user.role && <p className="text-xs text-indigo-300 mt-1 capitalize">Role: {user.role}</p>}
              {user.user_id && <p className="text-xs text-indigo-300 mt-0.5">User ID: {user.user_id}</p>}
            </div>
          </div>
        </div>

        {/* Profile Details Section */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* General Information */}
          <section>
            <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Account Information</h3>
            <dl className="space-y-4">
              <div className="flex items-start">
                <dt className="w-1/3 text-sm font-medium text-gray-500 flex items-center">
                  <EnvelopeIcon className="h-5 w-5 mr-2 text-indigo-500" />
                  Email Address
                </dt>
                <dd className="w-2/3 text-sm text-gray-900">{user.email}</dd>
              </div>
              {user.name && (
                <div className="flex items-start">
                  <dt className="w-1/3 text-sm font-medium text-gray-500 flex items-center">
                    <IdentificationIcon className="h-5 w-5 mr-2 text-indigo-500" />
                    Full Name
                  </dt>
                  <dd className="w-2/3 text-sm text-gray-900">{user.name}</dd>
                </div>
              )}
              {/* Add more fields from your user object if available */}
              {/* Example:
              {user.phone_number && (
                <div className="flex items-start">
                  <dt className="w-1/3 text-sm font-medium text-gray-500 flex items-center">
                    <DevicePhoneMobileIcon className="h-5 w-5 mr-2 text-indigo-500" />
                    Phone
                  </dt>
                  <dd className="w-2/3 text-sm text-gray-900">{user.phone_number}</dd>
                </div>
              )}
              */}
            </dl>
          </section>

          {/* Actions Section */}
          <section>
            <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Account Actions</h3>
            <div className="space-y-3 sm:space-y-0 sm:flex sm:space-x-4">
              <button
                onClick={() => navigate('/profile/edit')} // Placeholder for navigation to an edit page
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <PencilSquareIcon className="h-5 w-5 mr-2" />
                Edit Profile
              </button>
              <button
                onClick={() => navigate('/profile/change-password')} // Placeholder
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <KeyIcon className="h-5 w-5 mr-2" />
                Change Password
              </button>
            </div>
          </section>

          {/* Logout Section */}
          <section className="pt-6 border-t border-gray-200">
             <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" />
                Logout
              </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;