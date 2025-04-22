import Btn from '@/components/atoms/btn';
import FetchError from '@/components/molecules/fetch-error';
import Loading from '@/components/molecules/loading';
import SpotLightCard from '@/components/molecules/spotlight-card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';
import { useQuery } from '@/hooks/useFetch';
import { Link } from '@tanstack/react-router';
import React from 'react';

export interface ISpotlightListProps {
  admin?: boolean;
}

const SpotlightList: React.FC<ISpotlightListProps> = ({ admin = false }) => {
  const { data, error, isLoading, refetch } = useQuery('get', '/v1/club/spotlights');
  return (
    <div className="space-y-2">
      <h3 className="font-bold text-lg">Payment Links</h3>
      {admin && (
        <div className="flex items-center justify-end">
          <Link to="/admin/club/spotlights/create">
            <Btn>Create Spotlight</Btn>
          </Link>
        </div>
      )}
      <Loading isLoading={isLoading}>
        <FetchError isError={!!error || !data}>
          <div className="px-10">
            <Carousel>
              <CarouselContent>
                {data?.spotlights.map((spotlight) => (
                  <CarouselItem key={spotlight.id} className="md:basis-1/2 lg:basis-1/3">
                    <SpotLightCard
                      spotlight={spotlight}
                      admin={admin}
                      onSpotlightDelete={refetch}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </FetchError>
      </Loading>
    </div>
  );
};

export { SpotlightList };
