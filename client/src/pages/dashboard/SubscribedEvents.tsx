import { useMutation, useQuery } from '@/hooks/useFetch';
import React, { useEffect, useState } from 'react';
import EventCard, { Event } from '@/pages/dashboard/EventCard';

const SubscribedEvents = () => {
  const { data: se } = useQuery('get', '/v1/users/my/subscribed-events');
  const { mutate } = useMutation('delete', '/v1/users/my/subscribed-events/{eventID}');
  const [subscribedEvents, setSubscribedEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (!se) return;
    setSubscribedEvents(se.events as Event[]);
  }, [se]);

  const removeEvent = (event: Event) => {
    const newEvents = subscribedEvents.filter((e) => e.id !== event.id);
    mutate(
      {
        params: {
          path: {
            eventID: event.id.toString()
          }
        }
      },
      {
        onSuccess: () => {
          setSubscribedEvents(newEvents);
        }
      }
    );
  };

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-medium">Subscribed Events</h2>
      {subscribedEvents.length === 0 ? (
        <p>You have not subscribed to any events.</p>
      ) : (
        <div className="space-y-5">
          {subscribedEvents.map((event) => (
            <EventCard key={event.id} event={event as Event} onRemove={removeEvent} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SubscribedEvents;
