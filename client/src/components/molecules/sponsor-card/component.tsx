import { paths } from '@/types/schema.v1';
import React from 'react';

type Sponsor =
  paths['/v1/sponsors']['get']['responses']['200']['content']['application/json']['sponsors'][number];

export interface ISponsorCardProps {
  sponsor: Sponsor;
}

const SponsorCard: React.FC<ISponsorCardProps> = ({ sponsor }) => {
  return (
    <div className="w-full flex flex-col items-center justify-center">
      <img
        src={sponsor.logoKey}
        alt={`${sponsor.name} logo`}
        width={300}
        height={300}
        className="object-contain"
      />
    </div>
  );
};

export { SponsorCard };
