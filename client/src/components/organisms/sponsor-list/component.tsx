import FetchError from '@/components/molecules/fetch-error';
import Loading from '@/components/molecules/loading';
import SponsorCard from '@/components/molecules/sponsor-card';
import SponsorForm from '@/components/molecules/sponsor-form';
import { useQuery } from '@/hooks/useFetch';
import React from 'react';

export interface ISponsorListProps {
  admin?: boolean;
}

const SponsorList: React.FC<ISponsorListProps> = ({ admin = false }) => {
  const { data, error, isLoading, refetch } = useQuery('get', '/v1/sponsors');

  return (
    <div>
      {admin && (
        <div className="flex items-center justify-end gap-2">
          <SponsorForm onCreateComplete={refetch} />
        </div>
      )}
      <Loading isLoading={isLoading}>
        <FetchError isError={!!error}>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {data?.sponsors.map((sponsor) => (
              <SponsorCard
                key={sponsor.name}
                sponsor={sponsor}
                admin={admin}
                onSponsorDelete={refetch}
              />
            ))}
          </div>
        </FetchError>
      </Loading>
    </div>
  );
};

export { SponsorList };
