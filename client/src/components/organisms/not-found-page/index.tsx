import React from 'react';

const NotFoundPage: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center px-4">
      <h1 className="text-6xl font-bold text-gray-800 dark:text-gray-200">404</h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 mt-4">Page not found</p>
      <p className="mt-2 text-gray-500 dark:text-gray-500">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <div className="mt-6">
        <a
          href="/"
          className="inline-block px-5 py-3 bg-black text-white font-medium rounded-md hover:bg-gray-800 transition-colors"
        >
          Go back home
        </a>
      </div>
    </div>
  </div>
);

export default NotFoundPage;
