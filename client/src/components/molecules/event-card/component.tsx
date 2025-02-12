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
  deadline: string;
  presenter: string;
  description: string;
  eventType: string;
  keywords: string[];
};

export const EventCard: React.FC<EventCardProps> = ({
  title,
  location,
  date,
  deadline,
  presenter,
  description,
  eventType,
  keywords,
  className,
}) => {
  return (
    <Card className={cn(className, "pt-4 shadow-xl")}>
      <CardTitle className="pl-6">
        <p className="text-sm text-muted-foreground">
          {eventType.toUpperCase()}
        </p>
        <p className="text-lg">{title}</p>
      </CardTitle>
      <CardHeader>
        <p>Date: {date}</p>
        <p className="text-destructive font-bold">Deadline: {deadline}</p>
        <a href="#">Location: {location}</a>
        <p>Presenter(s): {presenter}</p>
      </CardHeader>
      <CardContent>{description}</CardContent>
      <CardFooter className="grid grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
        {keywords.map((keyword, index) => (
          <Btn variant="secondary" className="bg-[#318BCF]" key={index}>
            <p className="text-xs">{keyword}</p>
          </Btn>
        ))}
      </CardFooter>
    </Card>
  );
};
