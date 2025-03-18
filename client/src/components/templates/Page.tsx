import React from "react";
import { Toaster } from "@/components/ui/sonner";

interface IPageProps {
  children: React.ReactNode;
}

const Page: React.FC<IPageProps> = ({ children }) => {
  return (
    <div className="max-w-7xl m-auto p-10 space-y-10">
      {children}
      <Toaster />
    </div>
  );
};

export default Page;
