import Spinner from '@/components/atoms/spinner';
import SponsorCard from '@/components/molecules/sponsor-card';
import { useQuery } from '@/hooks/useFetch';
import React from 'react';

const SponsorList = () => {
  const { data, error, isLoading } = useQuery('get', '/v1/sponsors');
  return (
    <div className="space-y-2">
      <h3 className="font-bold text-lg">Sponsors</h3>
      {isLoading ? (
        <Spinner />
      ) : error ? (
        <p>Error loading sponsors</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data?.sponsors.map((sponsor) => <SponsorCard key={sponsor.name} sponsor={sponsor} />)}
        </div>
      )}
    </div>
  );
};

export { SponsorList };
