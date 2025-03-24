import Card, { CardContent, CardFooter, CardHeader, CardTitle } from '../../atoms/card';
import { Badge } from '@/components/ui/badge';
import { paths } from '@/types/schema.v1';

type FullEvent =
  paths['/v1/events']['get']['responses']['200']['content']['application/json']['foundEvents'][0];
type Event = Omit<
  FullEvent,
  | 'id'
  | 'deadline'
  | 'createdAt'
  | 'updatedAt'
  | 'urls'
  | 'eventCapacity'
  | 'image'
  | 'targetAudience'
  | 'shortenedEventUrl'
  | 'memberOnly'
>;
export const EventCard: React.FC<Event> = ({
  name,
  location,
  startDate,
  endDate,
  startTime,
  endTime,
  description,
  eventType,
  tags
}) => {
  function formatDate(date: string) {
    const dateObj = new Date(date);
    const month = dateObj.toLocaleString('default', { month: 'short' });
    const day = dateObj.getDate();
    const year = dateObj.getFullYear();
    return `${month} ${day}, ${year}`;
  }
  function formatTime(time: string) {
    const [hours, minutes] = time.substring(0, 5).split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  }
  return (
    <Card className="pt-4 shadow-md">
      <CardTitle className="pl-6">
        <p className="text-xs text-neutral">{eventType.toUpperCase()}</p>
        <p className="text-lg">{name}</p>
      </CardTitle>
      <CardHeader>
        <p>{`${formatDate(startDate)} ${formatTime(startTime)} - ${formatDate(endDate)} ${formatTime(endTime)}`}</p>
        <p>{location}</p>
      </CardHeader>
      <CardContent>{description}</CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge
            variant="secondary"
            className="bg-[#318BCF] cursor-default p-2 rounded-lg"
            key={tag}
          >
            <p className="text-xs text-white">{tag}</p>
          </Badge>
        ))}
      </CardFooter>
    </Card>
  );
};
