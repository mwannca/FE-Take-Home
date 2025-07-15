import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            🍎 Welcome to FruitsApp
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Explore, discover, and collect your favorite fruits with our interactive application.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <span className="text-4xl mb-4 block">📊</span>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Data Visualization</h3>
              <p className="text-gray-600">View calorie distribution with interactive charts</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <span className="text-4xl mb-4 block">🗂️</span>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Grouping</h3>
              <p className="text-gray-600">Group fruits by Family, Order, or Genus</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <span className="text-4xl mb-4 block">🍯</span>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Virtual Jar</h3>
              <p className="text-gray-600">Collect fruits and track your calories</p>
            </div>
          </div>
          
          <Link 
            to="/fruits" 
            className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors shadow-lg hover:shadow-xl"
          >
            Start Exploring Fruits
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 