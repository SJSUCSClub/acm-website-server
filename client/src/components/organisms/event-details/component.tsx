import React from 'react';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import FilesTable from '@/components/molecules/files-table';
import CompanyDialog from '@/components/molecules/company-dialog';
import SubscribeBtn from '@/components/molecules/subscribe-btn';
import AttendBtn from '@/components/molecules/attend-btn';
import BookmarkIcon from '@/components/molecules/bookmark-icon';
import { formatDate, formatTime } from '@/utils/formatter';
import { useMutation, useQuery } from '@/hooks/useFetch';
import Loading from '@/components/molecules/loading';
import FetchError from '@/components/molecules/fetch-error';
import DeleteAlert from '@/components/molecules/delete-alert';
import Btn from '@/components/atoms/btn';
import { Link, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { DEFAULT_EVENT_FILTERS } from '@/utils/constants';

interface IEventDetailsProps {
  eventId: string;
  admin?: boolean;
}

const EventDetails: React.FC<IEventDetailsProps> = ({ eventId, admin = false }) => {
  const navigate = useNavigate();
  const {
    data: event,
    isLoading: isLoadingEvent,
    error: errorEvent
  } = useQuery('get', '/v1/events/{eventID}', {
    params: {
      path: {
        eventID: eventId
      }
    }
  });
  const {
    data: eventCompanies,
    isLoading: isLoadingEventCompanies,
    error: errorEventCompanies
  } = useQuery('get', '/v1/events/{eventID}/companies', {
    params: {
      path: {
        eventID: eventId
      }
    }
  });
  const {
    data: eventFiles,
    isLoading: isLoadingEventFiles,
    error: errorEventFiles
  } = useQuery('get', '/v1/events/{eventID}/files', {
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
  const { mutate: deleteEvent } = useMutation('delete', '/v1/events/{eventID}');

  const handleEventDelete = () => {
    deleteEvent(
      {
        params: {
          path: {
            eventID: eventId
          }
        }
      },
      {
        onSuccess() {
          toast.success('Event deleted successfully');
          navigate({
            to: '/admin/events',
            replace: true,
            search: DEFAULT_EVENT_FILTERS
          });
        },
        onError() {
          toast.error('Failed to delete event');
        }
      }
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-8">
        <Loading isLoading={isLoadingEvent}>
          <FetchError isError={!!errorEvent}>
            <div className="relative rounded-xl overflow-hidden">
              <img
                src={event?.event.image}
                alt={event?.event.name}
                className="w-full h-full aspect-[2/3] object-cover"
              />
              {event && (
                <div className="absolute top-4 right-4 flex gap-2">
                  <BookmarkIcon id={event?.event.id.toString()} />
                </div>
              )}
            </div>
          </FetchError>
        </Loading>
        <div className="bg-muted p-6 rounded-xl space-y-4">
          <SubscribeBtn source="event" id={event?.event.id.toString() || ''} />
          <AttendBtn
            id={event?.event.id.toString() || ''}
            full={
              event?.event.eventCapacity !== null &&
              attendeeCount?.attendeesCount >= event?.event.eventCapacity
            }
          />
        </div>

        <Loading isLoading={isLoadingEventCompanies}>
          <FetchError isError={!!errorEventCompanies}>
            <div className="bg-muted p-6 rounded-xl">
              <h2 className="text-xl font-semibold mb-4">Participating Companies</h2>
              <div className="space-y-4">
                {eventCompanies?.eventCompanies.map((company) => (
                  <CompanyDialog key={company.id} company={company} />
                ))}
              </div>
            </div>
          </FetchError>
        </Loading>
      </div>

      <div className="space-y-8 lg:col-span-2">
        <Loading isLoading={isLoadingEvent}>
          <FetchError isError={!!errorEvent}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">{event?.event.name}</h1>
                {admin && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Link to={'/admin/events/$eventId/edit'} params={{ eventId }}>
                      <Btn>Edit</Btn>
                    </Link>
                    <DeleteAlert onDelete={handleEventDelete}>
                      <Btn className="bg-red-500">Delete</Btn>
                    </DeleteAlert>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {event?.event.memberOnly && <Badge variant="destructive">Members Only</Badge>}
                  <Badge variant="outline">{event?.event.eventType}</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {event?.event.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span>
                    {formatDate(event?.event.startDate || '')} -{' '}
                    {formatDate(event?.event.endDate || '')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>
                    {formatTime(event?.event.startTime || '')} -{' '}
                    {formatTime(event?.event.endTime || '')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>{event?.event.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>Audience: {event?.event.targetAudience || 'Everyone'}</span>
                </div>
                {event?.event.eventCapacity !== null && (
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span>Capacity: {event?.event.eventCapacity} attendees</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span>Attending: {attendeeCount?.attendeesCount} attendees</span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">About this event</h2>
              <p className="text-muted-foreground whitespace-pre-line">
                {event?.event.description}
              </p>
            </div>

            {event && event?.event.urls.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-3">Event Links</h2>
                <ul className="list-disc list-inside space-y-1 text-primary">
                  {event.event.urls.map((url, index) => (
                    <p key={index} className="text-blue-400">
                      <a href={url} target="_blank" className="hover:underline">
                        {url}
                      </a>
                    </p>
                  ))}
                </ul>
              </div>
            )}
          </FetchError>
        </Loading>

        <Loading isLoading={isLoadingEventFiles}>
          <FetchError isError={!!errorEventFiles}>
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-3">Files</h2>
              <FilesTable files={eventFiles?.eventFiles || []} />
            </div>
          </FetchError>
        </Loading>
      </div>
    </div>
  );
};

export { EventDetails };
