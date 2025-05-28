// src/components/layout/MainLayout.jsx (Create this new file)
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header'; // Adjust path to your Header.jsx

const MainLayout = () => {
  return (
    // <div className='min-h-screen bg-gradient-to-br from-slate-100 to-sky-100'>
    //   {/* Content Area: pt-16 (padding-top: 4rem or 64px) to offset fixed navbar's height (h-16) */}
    //   <main className="pt-16">
    //     <Header />
    //     <Outlet /> {/* Routed page components will render here */}
    //   </main>
    // </div>
    <div className='min-h-screen bg-gradient-to-br from-slate-100 to-sky-100'>
      {/* <Header /> */}
      {/* pt-16 is crucial to prevent content from being hidden by the fixed navbar */}
      <main className="">
        <Outlet /> {/* This is where the routed page components will be rendered */}
      </main>
    </div>
  );
};

export default MainLayout;