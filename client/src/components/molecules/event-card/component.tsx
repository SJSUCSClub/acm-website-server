import Card, {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../atoms/card";
import { Btn } from "../../atoms/btn";
import { cn } from "../../../utils/cn";

export type EventCardProps = Omit<
  React.ComponentProps<typeof Btn>,
  "variant" | "children" | "href"
> & {
  title: string;
  location: string;
  date: string;
  description: string;
  keywords: string[];
};

export const EventCard: React.FC<EventCardProps> = ({
  title,
  location,
  date,
  description,
  keywords,
  className,
}) => {
  return (
    <Card className={cn(className, "pt-4 shadow-md")}>
      <CardTitle className="pl-6">
        <p className="text-xs text-neutral">{eventType.toUpperCase()}</p>
        <p className="text-lg">{title}</p>
      </CardTitle>
      <CardHeader>
        <p>{date}</p>
        <a
          href={"https://www.google.com/maps/search/?api=1&query=" + location}
          target="_blank"
          className="underline text-[#196096]"
        >
          {location}
        </a>
      </CardHeader>
      <CardContent>{description}</CardContent>
      <CardFooter className="grid grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2">
        {keywords.map((keyword, index) => (
            <p className="pr-4" key={index}>{keyword}</p>
        ))}
      </CardFooter>
    </Card>
  );
};
