import Spinner from '@/components/atoms/spinner';
import SpotLightCard from '@/components/molecules/spotlight-card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';
import { useQuery } from '@/hooks/useFetch';
import React from 'react';

const SpotlightList = () => {
  const { data, error, isLoading } = useQuery('get', '/v1/club/spotlights');
  return (
    <div>
      {isLoading ? (
        <Spinner />
      ) : !data || error ? (
        <p>Error loading sponsors</p>
      ) : data.spotlights.length === 0 ? (
        <p className="text-center">No spotlights</p>
      ) : (
        <Carousel>
          <CarouselContent>
            {data.spotlights.map((spotlight) => (
              <CarouselItem key={spotlight.id} className="md:basis-1/2 lg:basis-1/3">
                <SpotLightCard spotlight={spotlight} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      )}
    </div>
  );
};

export { SpotlightList };
