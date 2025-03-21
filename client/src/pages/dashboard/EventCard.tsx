import Btn from '@/components/atoms/btn';
import Card, {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/atoms/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { paths } from '@/types/schema.v1';
import { CiCalendar, CiClock1, CiLocationOn, CiLock, CiUser } from 'react-icons/ci';

interface IEventCardProps {
  event: Event;
  onRemove: (event: Event) => void;
}

type BookmarkedEvent =
  paths['/v1/users/my/bookmarks']['get']['responses']['200']['content']['application/json']['bookmarks'][number];
type SubscribedEvent =
  paths['/v1/users/my/subscribed-events']['get']['responses']['200']['content']['application/json']['events'][number];
export type Event = BookmarkedEvent & SubscribedEvent;

const EventCard: React.FC<IEventCardProps> = ({ event, onRemove }) => {
  const date = new Date(event.bookmarkedDate || event.subscribedDate).toISOString().slice(0, 10);
  return (
    <Card>
      <CardHeader className="space-y-3">
        <CardTitle className="flex justify-between items-center space-x-2">
          <div className="flex justify-between items-center space-x-2">
            <p>{event.name}</p>
            {event.memberOnly && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <CiLock />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Event is member only</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <span className="text-sm">{date}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{event.bookmarkedDate ? 'Bookmarked' : 'Subscribed'} at</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription className="flex space-x-5 flex-wrap">
          <Badge>{event.eventType}</Badge>
          <Badge variant="secondary">For: {event.targetAudience || 'All'}</Badge>
          <div className="flex items-center space-x-1">
            <CiLocationOn />
            <p>{event.location}</p>
          </div>
          <div className="flex items-center space-x-1">
            <CiCalendar />
            <p>
              {event.startDate} - {event.endDate}
            </p>
          </div>
          <div className="flex items-center space-x-1">
            <CiClock1 />
            <p>
              {event.startTime} - {event.endTime}
            </p>
          </div>
          <div className="flex items-center space-x-1">
            <CiUser />
            <p>{event.eventCapacity}</p>
          </div>
        </CardDescription>
        <div className="flex items-center flex-wrap space-x-2">
          {event.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent>{event.description}</CardContent>
      <CardFooter>
        <Btn size="sm" onClick={() => onRemove(event)}>
          Remove
        </Btn>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
