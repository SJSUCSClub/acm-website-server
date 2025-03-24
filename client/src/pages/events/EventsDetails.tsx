import React from "react";
import Page from "@/components/templates/Page";
import { Route } from "@/routes/events/$eventId";
import { useQuery } from "@/hooks/useFetch";
import EventDetails from "@/components/organisms/event-details";
import Spinner from "@/components/atoms/spinner";

const EventsDetailsPage = () => {
  const { eventId } = Route.useParams();
  const { data: event } = useQuery('get', '/v1/events/{eventID}', {
    params: {
      path: {
        eventID: eventId
      }
    }
  });
  const { data: eventCompanies } = useQuery('get', '/v1/events/{eventID}/companies', {
    params: {
      path: {
        eventID: eventId
      }
    }
  });
  const { data: eventFiles } = useQuery('get', '/v1/events/{eventID}/files', {
    params: {
      path: {
        eventID: eventId
      }
    }
  });
  const { data: attendeeCount } = useQuery('get', '/v1/events/{eventID}/attendance/count', {
    params: {
      path: {
        eventID: eventId
      }
    }
  });

  return (
    <Page>
      {event && eventCompanies && eventFiles && attendeeCount ? (
        <EventDetails
          event={event.event}
          companies={eventCompanies.eventCompanies}
          files={eventFiles.eventFiles}
          attendeeCount={attendeeCount.attendeesCount}
        />
      ) : (
        <Spinner />
      )}
    </Page>
  );
};

export default EventsDetailsPage;
