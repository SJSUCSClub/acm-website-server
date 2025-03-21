import { useMutation, useQuery } from '@/hooks/useFetch';
import React, { useEffect, useState } from 'react';
import EventCard, { Event } from '@/pages/dashboard/EventCard';

const BookmarkedEvents = () => {
  const { data: be } = useQuery('get', '/v1/users/my/bookmarks');
  const { mutate } = useMutation('delete', '/v1/users/my/bookmarked/{eventID}');
  const [bookmarkedEvents, setBookmarkedEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (!be) return;
    setBookmarkedEvents(be.bookmarks as Event[]);
  }, [be]);

  const removeEvent = (event: Event) => {
    const newEvents = bookmarkedEvents.filter((e) => e.id !== event.id);
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
          setBookmarkedEvents(newEvents);
        },
      }
    );
  };

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-medium">Bookmarked Events</h2>
      {bookmarkedEvents.length === 0 ? (
        <p>You have not bookmarked any events.</p>
      ) : (
        <div className="space-y-5">
          {bookmarkedEvents.map((event) => (
            <EventCard key={event.id} event={event as Event} onRemove={removeEvent} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BookmarkedEvents;
