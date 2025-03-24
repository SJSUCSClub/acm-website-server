import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Card, {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../atoms/card";
import { Badge } from "@/components/ui/badge";
import { paths } from "@/types/schema.v1";
import { formatDate, formatTime } from "@/utils/formatter";
import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";

type Event =
  paths["/v1/events"]["get"]["responses"]["200"]["content"]["application/json"]["foundEvents"][number];
interface IEventCardProps {
  event: Event;
}

export const EventCard: React.FC<IEventCardProps> = ({ event }) => {
  return (
    <Card className="pt-4 shadow-md">
      <CardHeader>
        <CardTitle>
          <p className="text-xs text-neutral">
            {event.eventType.toUpperCase()}
          </p>
          <div className="flex space-x-3">
            <Link
              to="/events/$eventId"
              params={{ eventId: event.id.toString() }}
            >
              <p className="text-lg">{event.name}</p>
            </Link>
            {event.memberOnly && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Lock size={20} />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Event is member only</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </CardTitle>
        <p>{`${formatDate(event.startDate)} ${formatTime(event.startTime)} - ${formatDate(event.endDate)} ${formatTime(event.endTime)}`}</p>
        <p>{event.location}</p>
      </CardHeader>
      <CardContent>{event.description}</CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        {event.tags.map((tag) => (
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
