import { useMutation, useQuery } from '@/hooks/useFetch';
import React, { useEffect, useState } from 'react';
import { paths } from '@/types/schema.v1';
import CompanyCard from '@/pages/dashboard/CompanyCard';

type SubscribedCompany =
  paths['/v1/users/my/subscribed-companies']['get']['responses']['200']['content']['application/json']['companies'][number];

const SubscribedCompanies = () => {
  const { data: sc } = useQuery('get', '/v1/users/my/subscribed-companies');
  const { mutate } = useMutation('delete', '/v1/users/my/subscribed-companies/{companyID}');
  const [subscribedCompanies, setSubscribedCompanies] = useState<SubscribedCompany[]>([]);

  useEffect(() => {
    if (!sc) return;
    setSubscribedCompanies(sc.companies);
  }, [sc]);

  const removeCompany = (company: SubscribedCompany) => {
    const newCompanies = subscribedCompanies.filter((c) => c.id !== company.id);
    mutate(
      {
        params: {
          path: {
            companyID: company.id.toString()
          }
        }
      },
      {
        onSuccess: () => {
          setSubscribedCompanies(newCompanies);
        },
      }
    );
  };

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-medium">Subscribed Companies</h2>
      {subscribedCompanies.length === 0 ? (
        <p>You have not subscribed to any companies.</p>
      ) : (
        <div className="space-y-5">
          {subscribedCompanies.map((company) => (
            <CompanyCard key={company.id} company={company} onRemove={removeCompany} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SubscribedCompanies;
