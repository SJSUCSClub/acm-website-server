import React from "react";

interface IPageProps {
  children: React.ReactNode;
}

const Page: React.FC<IPageProps> = ({ children }) => {
  return (
    <div className="max-w-7xl m-auto p-10 space-y-10">
      {children}
    </div>
  );
};

export default Page;
