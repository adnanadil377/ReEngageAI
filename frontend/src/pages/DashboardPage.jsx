// src/pages/DashboardPage.jsx
import Dashboard from '../features/dashboard/Dashboard'; // The Dashboard content component from the previous example
import Header from '../components/Header';

const DashboardPage = () => {
  return (
    // Container for dashboard view with its own padding
    <div className="py-8 pt-20 px-4 sm:px-6 lg:px-8">
      <Header />
      <header className="mb-8 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-800 sm:text-5xl">
          Dashboard
        </h1>
        <p className="mt-3 text-lg text-gray-600">
          Welcome to your dashboard overview.
        </p>
      </header>
      {/* Assuming Dashboard component provides the actual dashboard content */}
      <Dashboard />
    </div>
  );
};

export default DashboardPage;