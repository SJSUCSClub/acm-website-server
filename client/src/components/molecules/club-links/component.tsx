import Spinner from '@/components/atoms/spinner';
import { useQuery } from '@/hooks/useFetch';
import React from 'react';
import ClubLink from '@/components/molecules/club-link';

const ClubLinks = () => {
  const { data, error, isLoading } = useQuery('get', '/v1/club/links');
  return (
    <div className="space-y-4">
      {isLoading ? (
        <Spinner />
      ) : !data || error ? (
        <p>Error loading club links</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <ClubLink link={data.links.discord || ''} type="discord" />
          <ClubLink link={data.links.instagram || ''} type="instagram" />
          <ClubLink link={data.links.linkedin || ''} type="linkedin" />
          <ClubLink link={data.links.memberApplication || ''} type="memberApplication" />
        </div>
      )}
    </div>
  );
};
export { ClubLinks };
