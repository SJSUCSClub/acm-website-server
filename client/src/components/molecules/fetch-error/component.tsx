import React from 'react';

export interface IFetchErrorProps {
  isError: boolean;
  children: React.ReactNode;
}

const FetchError: React.FC<IFetchErrorProps> = ({ isError, children }) => {
  return <div>{isError ? <p className="text-center">Error loading data</p> : children}</div>;
};

export { FetchError };
