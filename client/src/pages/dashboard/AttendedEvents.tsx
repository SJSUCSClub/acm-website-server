import { useMutation, useQuery } from '@/hooks/useFetch';
import React, { useEffect, useState } from 'react';
import EventCard, { Event } from '@/pages/dashboard/EventCard';

const AttendedEvents = () => {
  const { data: ae } = useQuery('get', '/v1/users/my/attending-events');
  const { mutate } = useMutation('delete', '/v1/users/my/attending-events/{eventID}');
  const [attendedEvents, setAttendedEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (!ae) return;
    setAttendedEvents(ae.events as Event[]);
  }, [ae]);

  const removeEvent = (event: Event) => {
    const newEvents = attendedEvents.filter((e) => e.id !== event.id);
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
          setAttendedEvents(newEvents);
        }
      }
    );
  };

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-medium">Attending Events</h2>
      {attendedEvents.length === 0 ? (
        <p>You have not registered to attend any events.</p>
      ) : (
        <div className="space-y-5">
          {attendedEvents.map((event) => (
            <EventCard key={event.id} event={event as Event} onRemove={removeEvent} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AttendedEvents;
