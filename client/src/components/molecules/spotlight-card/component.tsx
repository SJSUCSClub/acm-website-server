import { paths } from '@/types/schema.v1';
import Card, { CardHeader } from '@/components/atoms/card';
import React from 'react';

type Spotlight =
  paths['/v1/club/spotlights']['get']['responses']['200']['content']['application/json']['spotlights'][number];
export interface ISpotLightCardProps {
  spotlight: Spotlight;
}

export const SpotLightCard: React.FC<ISpotLightCardProps> = ({ spotlight }) => (
  <Card>
    <CardHeader className="p-0">
      <img
        src={spotlight.image}
        alt={`Event spotlight for ${spotlight.name}`}
        width={300}
        className="object-cover rounded-t-lg w-full h-full"
      />
    </CardHeader>
    <div className="p-4 text-left">
      <div>
        <p className="text-muted-foreground text-xs font-bold">{spotlight.type}</p>
        <h3 className="font-semibold text-lg mb-2">{spotlight.name}</h3>
      </div>
      <p className="text-sm text-muted-foreground">{spotlight.description}</p>
    </div>
  </Card>
);
