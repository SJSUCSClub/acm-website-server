import React from 'react';
import SubscribedEvents from '@/pages/dashboard/SubscribedEvents';
import BookmarkedEvents from '@/pages/dashboard/BookmarkedEvents';
import SubscribedCompanies from '@/pages/dashboard/SubscribedCompanies';
import ProjectsInInterest from '@/pages/dashboard/ProjectsInInterest';
import AttendedEvents from '@/pages/dashboard/AttendedEvents';

const Dashboard = () => {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <div className="space-y-10">
        <AttendedEvents />
        <SubscribedEvents />
        <BookmarkedEvents />
        <SubscribedCompanies />
        <ProjectsInInterest />
      </div>
    </div>
  );
};

export default Dashboard;
