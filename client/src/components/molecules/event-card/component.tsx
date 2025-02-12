import Card, {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../atoms/card";
import { Badge } from "@/components/ui/badge"
import { paths } from "@/types/schema.v1";

type FullEvent = paths["/v1/events"]["get"]["responses"]["200"]["content"]["application/json"]["foundEvents"][0];
type Event = Omit<FullEvent, "id" | "deadline" | "createdAt" | "updatedAt" | "urls" | "eventCapacity" | "image" | "targetAudience" | "shortenedEventUrl" |  "memberOnly">;
export const EventCard: React.FC<Event> = ({
  name,
  location,
  startDate,
  endDate,
  startTime,
  endTime,
  description,
  eventType,
  tags,
}) => {
    function formatDate(date: string) {
      const dateObj = new Date(date);
      const month = dateObj.toLocaleString("default", { month: "short" });
      const day = dateObj.getDate();
      const year = dateObj.getFullYear();
      return `${month} ${day}, ${year}`;
    }
    function formatTime(time: string) {
      const [hours, minutes] = time.substring(0, 5).split(":");
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? "PM" : "AM";
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${minutes} ${ampm}`;
    }
  return (
    <Card className={cn(className, "pt-4 shadow-md")}>
      <CardTitle className="pl-6">
        <p className="text-xs text-neutral">{eventType.toUpperCase()}</p>
        <p className="text-lg">{title}</p>
      </CardTitle>
      <CardHeader>
        <p>{date}</p>
        <p className="text-[#A60000] font-bold">Deadline: {deadline}</p>
        <a
          href={"https://www.google.com/maps/search/?api=1&query=" + location}
          target="_blank"
          className="underline text-[#196096]"
        >
          {location}
        </a>
        <p>Presented by {presenter}</p>
      </CardHeader>
      <CardContent>{description}</CardContent>
      <CardFooter className="grid grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2">
        {keywords.map((keyword, index) => (
          <Btn
            variant="secondary"
            className="bg-[#318BCF] cursor-default px-2"
            key={index}
          >
            <p className="text-xs">{keyword}</p>
          </Btn>
        ))}
      </CardFooter>
    </Card>
  );
};
