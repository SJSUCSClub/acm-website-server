import Page from '@/components/templates/Page';
import React from 'react';
import SubscribedEvents from '@/pages/dashboard/SubscribedEvents';
import BookmarkedEvents from '@/pages/dashboard/BookmarkedEvents';
import SubscribedCompanies from '@/pages/dashboard/SubscribedCompanies';
import ProjectsInInterest from '@/pages/dashboard/ProjectsInInterest';
import AttendedEvents from '@/pages/dashboard/AttendedEvents';

const Dashboard = () => {
  return (
    <Page>
      <div className="space-y-5">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <div className="space-y-10">
          <AttendedEvents />
          <SubscribedEvents />
          <BookmarkedEvents />
          <SubscribedCompanies />
          <ProjectsInInterest />
        </div>
      </div>
    </Page>
  );
};

export default Dashboard;
