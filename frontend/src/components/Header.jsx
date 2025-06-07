// src/components/Header.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import {
  ChatBubbleLeftRightIcon,
  ChartPieIcon,
  UserGroupIcon,
  ArrowRightOnRectangleIcon, // For Login/Logout
  UserCircleIcon,           // For Profile
  TagIcon, // Example for a more specific icon if available and desired - not used yet
  DocumentTextIcon, // For Message Templates
} from '@heroicons/react/24/outline';
import useAuth from '../auth/useAuth'; // Import your useAuth hook

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth(); // Use the auth context

  const navigation = [
    { name: 'Chat', href: '/chat', icon: ChatBubbleLeftRightIcon, showIfAuthenticated: true },
    { name: 'Dashboard', href: '/dashboard', icon: ChartPieIcon, showIfAuthenticated: true },
    { name: 'User Categories', href: '/campaigns/categories', icon: UserGroupIcon, showIfAuthenticated: true },
    { name: 'Message Templates', href: '/campaigns/templates', icon: DocumentTextIcon, showIfAuthenticated: true }, // Added Message Templates
    // Consider a top-level "Campaigns" link later that leads to a sub-menu or dashboard for all campaign features
  ];

  const handleLogoutClick = () => {
    logout(); // Call the logout function from useAuth
    navigate('/login'); // Navigate to login page after logout (or /authorize or homepage)
  };

  // Optional: Get user's initial for profile icon if `user` object has a name
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : '?');


  return (
    <nav className="bg-white shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section: Logo & Main Navigation (Desktop) */}
          <div className="flex items-center">
            {/* Logo/Brand Section */}
            <div className="flex-shrink-0 flex items-center">
              <UserGroupIcon className="h-8 w-auto text-indigo-600" />
              <NavLink to={isAuthenticated ? "/chat" : "/"} className="ml-3 text-2xl font-bold text-gray-800"> {/* Logo links to chat if logged in, else homepage */}
                ReEngage
              </NavLink>
            </div>

            {/* Desktop Navigation Links - Conditionally render based on auth and item.showIfAuthenticated */}
            {isAuthenticated && (
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  {navigation.filter(item => item.showIfAuthenticated).map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={({ isActive }) =>
                        `group flex items-center px-3 py-2 border-b-2 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out ${
                          isActive
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                            : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {item.icon && (
                            <item.icon
                              className={`mr-2 flex-shrink-0 h-5 w-5 ${
                                isActive
                                  ? 'text-indigo-500'
                                  : 'text-gray-400 group-hover:text-gray-500'
                              }`}
                              aria-hidden="true"
                            />
                          )}
                          {item.name}
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Section: Auth Buttons (Desktop) & Mobile Menu Icons */}
          <div className="flex items-center">
            {/* Desktop Auth/Profile Buttons */}
            <div className="hidden md:flex items-center space-x-3 ml-4"> {/* Reduced space-x for tighter fit */}
              {isAuthenticated ? (
                <>
                  <NavLink
                    to="/profile" // Make sure you have a /profile route
                    className="group flex items-center p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                    title={user?.email || 'Profile'} // Show email in tooltip
                  >
                     {/* Using a simple initial or icon for profile */}
                     <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold">
                        {userInitial}
                     </span>
                     <span className="ml-2 text-sm font-medium hidden lg:block">{user?.name || user?.email || 'Profile'}</span>
                  </NavLink>
                  <button
                    onClick={handleLogoutClick}
                    className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors duration-150 ease-in-out"
                    title="Logout"
                  >
                    <ArrowRightOnRectangleIcon
                      className="mr-1.5 h-5 w-5 text-gray-400 group-hover:text-red-500"
                      aria-hidden="true"
                    />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </>
              ) : (
                <NavLink
                  to="/login" // Changed from /auth to /login to match typical login page route
                  className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-indigo-600 hover:bg-indigo-50 transition-colors duration-150 ease-in-out"
                >
                  <ArrowRightOnRectangleIcon
                    className="mr-1.5 h-5 w-5 text-indigo-500 group-hover:text-indigo-600"
                    aria-hidden="true"
                  />
                  Login
                </NavLink>
              )}
            </div>

            {/* Mobile menu icons (main nav + auth icons) */}
            {/* The mobile section needs to be simplified or use a proper dropdown for many items */}
            <div className="-mr-2 flex items-center md:hidden space-x-1 sm:space-x-2">
              {isAuthenticated && navigation.filter(item => item.showIfAuthenticated).map((item) => (
                <NavLink
                  key={item.name + "-mobile"}
                  to={item.href}
                  className={({ isActive }) =>
                    `group p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors duration-150 ease-in-out ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                    }`
                  }
                  title={item.name}
                >
                  {({ isActive }) => ( // Access isActive here
                    <>
                      <span className="sr-only">{item.name}</span>
                      {item.icon && (
                        <item.icon
                          className={`h-6 w-6 ${
                            isActive ? 'text-indigo-700' : 'text-gray-500 group-hover:text-gray-700'
                          }`}
                          aria-hidden="true"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}

              {/* Conditional Mobile Auth Icons */}
              {isAuthenticated ? (
                <>
                  <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                      `group p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors duration-150 ease-in-out ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                      }`
                    }
                    title="Profile"
                  >
                    {({ isActive }) => ( // Access isActive here
                      <>
                        <span className="sr-only">Profile</span>
                        <UserCircleIcon
                          className={`h-6 w-6 ${
                            isActive ? 'text-indigo-700' : 'text-gray-500 group-hover:text-gray-700'
                          }`}
                          aria-hidden="true"
                        />
                      </>
                    )}
                  </NavLink>
                  <button
                    onClick={handleLogoutClick}
                    className="group p-2 rounded-md text-gray-500 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors duration-150 ease-in-out"
                    title="Logout"
                  >
                    <span className="sr-only">Logout</span>
                    <ArrowRightOnRectangleIcon className="h-6 w-6 text-gray-500 group-hover:text-red-500" aria-hidden="true" />
                  </button>
                </>
              ) : (
                <NavLink
                  to="/login" // Changed from /auth to /login
                  className={({ isActive }) =>
                    `group p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors duration-150 ease-in-out ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                    }`
                  }
                  title="Login"
                >
                  {({ isActive }) => ( // Access isActive here
                    <>
                      <span className="sr-only">Login</span>
                      <ArrowRightOnRectangleIcon
                        className={`h-6 w-6 ${
                          isActive ? 'text-indigo-700' : 'text-gray-500 group-hover:text-gray-700'
                        }`}
                        aria-hidden="true"
                      />
                    </>
                  )}
                </NavLink>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;