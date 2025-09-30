import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Link } from '@tanstack/react-router';
import { DEFAULT_EVENT_FILTERS } from '@/utils/constants';
import Card, { CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/atoms/card';
import Btn from '@/components/atoms/btn';

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
        <Card>
          <CardHeader>
            <CardTitle>Club Management</CardTitle>
            <CardDescription>Manage club links and payment methods</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link to="/admin/club" className="w-full">
              <Btn className="w-full">Manage Club</Btn>
            </Link>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage users and their permissions</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link to="/admin/users" className="w-full">
              <Btn className="w-full">Manage Users</Btn>
            </Link>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Event Management</CardTitle>
            <CardDescription>Create and manage events</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link to="/admin/events" search={DEFAULT_EVENT_FILTERS} className="w-full">
              <Btn className="w-full">Manage Events</Btn>
            </Link>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Company Management</CardTitle>
            <CardDescription>Create and manage companies we work with</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link to="/admin/companies" className="w-full">
              <Btn className="w-full">Manage Companies</Btn>
            </Link>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Project Management</CardTitle>
            <CardDescription>Manage Dev Team Projects</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link to="/admin/projects" className="w-full">
              <Btn className="w-full">Manage Projects</Btn>
            </Link>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Officer Management</CardTitle>
            <CardDescription>Manage Club Officers</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link to="/admin/officers" className="w-full">
              <Btn className="w-full">Manage Officers</Btn>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AdminHome;
