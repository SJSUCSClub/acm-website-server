import React from 'react';
import { Toaster } from '@/components/ui/sonner';

interface IPageProps {
  children: React.ReactNode;
}

const Page: React.FC<IPageProps> = ({ children }) => {
  return (
    <div className="w-full max-w-7xl mx-auto p-2 md:p-6 space-y-4 md:space-y-6 lg:space-y-10 overflow-x-hidden">
      {children}
      <Toaster />
    </div>
  );
};

export default Page;
