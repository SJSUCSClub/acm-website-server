import React from "react";

interface IPageProps {
  children: React.ReactNode;
}

const Page: React.FC<IPageProps> = ({ children }) => {
  return (
    <div className="min-w-full pt-10 pb-20 px-[5%]">
      {children}
    </div>
  );
};

export default Page;
