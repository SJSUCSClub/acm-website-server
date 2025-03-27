import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Link } from '@tanstack/react-router';

const AdminHome = () => {
  const { user } = useAuth();

  return (
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
          <h2 className="text-lg font-semibold mb-2">Club Management</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">
            Manage club links and payment methods
          </p>
          <Link to="/admin/club">
            <button className="bg-black hover:bg-gray-800 text-white py-2 px-4 rounded w-full mt-auto">
              Manage Club
            </button>
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow h-full flex flex-col">
          <h2 className="text-lg font-semibold mb-2">User Management</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">
            Manage users and their permissions
          </p>
          <Link to="/admin/users">
            <button className="bg-black hover:bg-gray-800 text-white py-2 px-4 rounded w-full mt-auto">
              Manage Users
            </button>
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow h-full flex flex-col">
          <h2 className="text-lg font-semibold mb-2">Event Management</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">
            Create and manage events
          </p>
          <Link to="/admin/events">
            <button className="bg-black hover:bg-gray-800 text-white py-2 px-4 rounded w-full mt-auto">
              Manage Events
            </button>
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow h-full flex flex-col">
          <h2 className="text-lg font-semibold mb-2">Event Companies</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">
            Create and manage companies we work with
          </p>
          <Link to="/admin/companies">
            <button className="bg-black hover:bg-gray-800 text-white py-2 px-4 rounded w-full mt-auto">
              Manage Companies
            </button>
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow h-full flex flex-col">
          <h2 className="text-lg font-semibold mb-2">Project Management</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">
            Manage Dev Team Projects
          </p>
          <Link to="/admin/projects">
            <button className="bg-black hover:bg-gray-800 text-white py-2 px-4 rounded w-full mt-auto">
              Manage Projects
            </button>
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow h-full flex flex-col">
          <h2 className="text-lg font-semibold mb-2">Officer Management</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">Manage Club Officers</p>
          <Link to="/admin/officers">
            <button className="bg-black hover:bg-gray-800 text-white py-2 px-4 rounded w-full mt-auto">
              Manage Officers
            </button>
          </Link>
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
  );
};

export default AdminHome;
