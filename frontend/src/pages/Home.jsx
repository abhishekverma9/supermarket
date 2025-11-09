import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate()
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center gap-12 py-12 px-4">
      <div className="flex flex-col gap-4 items-center">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-yellow-950 via-purple-950 to-pink-950 animate-gradient-x">
          Nexus Platform
        </h1>
        <p className="max-w-xl text-lg md:text-xl text-gray-600 dark:text-gray-300 text-center">
          Login to continue.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mt-4">
        <button onClick={() => navigate('/login')} className="px-6 py-3 font-semibold text-white bg-indigo-600 rounded-lg shadow-lg hover:bg-indigo-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-50 dark:focus:ring-offset-slate-900">
          Get Started
        </button>
        <button className="px-6 py-3 font-semibold text-gray-800 dark:text-white bg-white/80 dark:bg-slate-800/80 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-50 dark:focus:ring-offset-slate-900">
          Explore Features
        </button>
      </div>
    </div>
  );
};

export default Home;


