import React from 'react';
import { useAuth } from '@/hooks/useAuth';

const AdminHome = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

        <div className="mb-6">
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-gray-800 dark:text-gray-200">
              Welcome, <span className="font-semibold">{user?.name}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow h-full flex flex-col">
            <h2 className="text-lg font-semibold mb-2">User Management</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">
              Manage users and their permissions
            </p>
            <button className="bg-black hover:bg-gray-800 text-white py-2 px-4 rounded w-full mt-auto">
              Manage Users
            </button>
          </div>

          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow h-full flex flex-col">
            <h2 className="text-lg font-semibold mb-2">Event Management</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">
              Create and manage events
            </p>
            <button className="bg-black hover:bg-gray-800 text-white py-2 px-4 rounded w-full mt-auto">
              Manage Events
            </button>
          </div>

          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow h-full flex flex-col">
            <h2 className="text-lg font-semibold mb-2">Content Management</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">
              Manage website content and resources
            </p>
            <button className="bg-black hover:bg-gray-800 text-white py-2 px-4 rounded w-full mt-auto">
              Manage Content
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
