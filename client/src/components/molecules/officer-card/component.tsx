import Card, { CardContent, CardFooter, CardHeader } from '@/components/atoms/card';
import React from 'react';
import LinkedinBtn from '../linkedin-btn';
import { paths } from '@/types/schema.v1';

type Officer =
  paths['/v1/officers']['get']['responses']['200']['content']['application/json']['officers'][number];
export interface IOfficerCardProps {
  officer: Officer;
}

export const OfficerCard: React.FC<IOfficerCardProps> = ({ officer }) => (
  <Card>
    <CardHeader>
      <div className="w-full h-60 bg-muted m-auto rounded-lg overflow-hidden">
        <img src={officer.photo || ''} alt="Photo" className="object-cover w-full h-full" />
      </div>
    </CardHeader>
    <CardContent>
      <span className="text-xs text-neutral">{officer.position}</span>{' '}
      <h1 className="font-bold text-lg px-7">{officer.id}</h1>
    </CardContent>
    <CardFooter>
      <div className="flex justify-start items-center w-full px-2 py-3">
        {officer.linkedin && <LinkedinBtn href={officer.linkedin} />}
      </div>
    </CardFooter>
  </Card>
);
