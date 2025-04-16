import FetchError from '@/components/molecules/fetch-error';
import Loading from '@/components/molecules/loading';
import { useQuery } from '@/hooks/useFetch';
import CompanyCard from '@/components/molecules/company-card';
import React from 'react';

export interface ICompanyListProps {
  admin?: boolean;
}

const CompanyList: React.FC<ICompanyListProps> = ({ admin = false }) => {
  const { data: companies, isLoading, error } = useQuery('get', '/v1/companies');
  return (
    <div className="space-y-5">
      <h1 className="text-4xl font-bold">Companies</h1>
      <Loading isLoading={isLoading}>
        <FetchError isError={!!error || !companies}>
          <div className="grid grid-cols-3 gap-4">
            {companies?.companies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        </FetchError>
      </Loading>
    </div>
  );
};

export { CompanyList };
