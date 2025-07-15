import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center text-2xl font-bold text-gray-900 hover:text-primary-600 transition-colors">
              🍎 FruitsApp
            </Link>
            <div className="flex space-x-8">
              <Link 
                to="/" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/' 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/fruits" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/fruits' 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                Fruits
              </Link>
            </div>
          </div>
        </nav>
      </header>
      
      <main className="flex-1">
        {children}
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            &copy; 2024 FruitsApp. Built with React & TypeScript.
          </p>
        </div>
      </footer>
    </div>
  );
}; 