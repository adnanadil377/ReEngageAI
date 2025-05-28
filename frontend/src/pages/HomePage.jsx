import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SparklesIcon, ChatBubbleLeftRightIcon, ChartBarIcon, LockClosedIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Header from '../components/Header';

// Mock auth hook - replace with your actual authentication check
const useAuth = () => {
  // In a real app, this would come from a global context or Redux store
  const isAuthenticated = !!localStorage.getItem('authToken'); // Simple check
  return { isAuthenticated };
};

const features = [
  {
    name: 'Seamless Chat Integration',
    description: 'Engage with your customers in real-time with our intuitive chat platform, designed for efficiency and ease of use.',
    icon: ChatBubbleLeftRightIcon,
    bgColor: 'bg-indigo-500',
  },
  {
    name: 'Insightful Dashboard',
    description: 'Gain valuable insights into your customer interactions and team performance with our comprehensive analytics dashboard.',
    icon: ChartBarIcon,
    bgColor: 'bg-green-500',
  },
  {
    name: 'Secure and Reliable',
    description: 'Your data is protected with top-tier security measures, ensuring privacy and reliability for all your communications.',
    icon: LockClosedIcon,
    bgColor: 'bg-sky-500',
  },
];

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth(); // Check if user is logged in

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-100">
        <Header />
      {/* Navigation Bar (Can be your existing Header.jsx or a simplified one for homepage) */}
      {/* For this example, let's assume your main Header.jsx is already part of AppLayout */}
      {/* If this page is NOT part of AppLayout, you might add a simple nav here: */}
      {/* <nav className="p-4 bg-white shadow-sm"> ... </nav> */}


      {/* Hero Section */}
      <main>
        <div className="relative isolate overflow-hidden pt-14"> {/* pt-14 if no separate navbar on this page, or adjust as needed */}
          {/* Decorative background elements (optional) */}
          <div
            className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
            aria-hidden="true"
          >
            <div
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#80ff89] to-[#0077ff] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
            />
          </div>

          <div className="mx-auto max-w-4xl py-20 sm:py-32 lg:py-36 px-6 lg:px-8">
            <div className="text-center">
              <SparklesIcon className="mx-auto h-16 w-16 text-indigo-600 mb-6 animate-pulse" />
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                Connect, Engage, and Grow with <span className="text-indigo-600">Your App</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                The ultimate platform for managing customer communications and driving business success.
                Experience seamless chat and powerful dashboard analytics all in one place.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                {isAuthenticated ? (
                  <button
                    onClick={() => navigate('/dashboard')} // Or /chat, depending on default for logged-in users
                    className="rounded-md bg-indigo-600 px-5 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
                  >
                    Go to Dashboard
                    <ArrowRightIcon className="inline h-5 w-5 ml-2 -mr-1" />
                  </button>
                ) : (
                  <>
                    <button
                      // onClick={() => navigate('/signup')} // Or a dedicated "Get Started" page
                      className="rounded-md bg-indigo-600 px-5 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
                    >
                      Contact Sales
                    </button>
                    <button
                      onClick={() => navigate('/login')}
                      className="text-base font-semibold leading-6 text-gray-900 hover:text-gray-700 transition-colors"
                    >
                      Login <span aria-hidden="true">→</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-indigo-600">Why Choose Us?</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Everything you need to elevate your customer interactions.
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Our platform is built with your needs in mind, providing powerful tools that are
                simple to use and drive real results.
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                {features.map((feature) => (
                  <div key={feature.name} className="flex flex-col p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-gray-100">
                    <dt className="flex items-center gap-x-3 text-xl font-semibold leading-7 text-gray-900">
                      <div className={`flex-none rounded-lg p-2 ${feature.bgColor}`}>
                        <feature.icon className="h-7 w-7 text-white" aria-hidden="true" />
                      </div>
                      {feature.name}
                    </dt>
                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                      <p className="flex-auto">{feature.description}</p>
                      <p className="mt-6">
                        <a
                          href="#" // Link to a more detailed feature page if available
                          className="text-sm font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
                        >
                          Learn more <span aria-hidden="true">→</span>
                        </a>
                      </p>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        {/* Another Call to Action Section (Optional) */}
        <div className="bg-slate-50 py-16 sm:py-24">
          <div className="mx-auto max-w-4xl text-center px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Ready to transform your customer service?
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              Join thousands of businesses already benefiting from our platform.
              Start your journey with us today.
            </p>
            <div className="mt-10">
              <button
                onClick={() => isAuthenticated ? navigate('/dashboard') : navigate('/signup')}
                className="rounded-md bg-indigo-600 px-6 py-3.5 text-lg font-semibold text-white shadow-md hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
              >
                {isAuthenticated ? 'Explore Dashboard' : 'Create Your Account'}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          {/* <img className="mx-auto h-10 w-auto" src="/path-to-your-logo-white.svg" alt="Your Company" /> */}
          <p className="mt-4 text-gray-400">© {new Date().getFullYear()} Your App Name. All rights reserved.</p>
          <div className="mt-4 flex justify-center space-x-6">
            <a href="#" className="text-gray-400 hover:text-gray-300">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-gray-300">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;