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
  description: string;
  keywords: string[];
};

export const EventCard: React.FC<EventCardProps> = ({
  title,
  location,
  date,
  deadline,
  description,
  keywords,
  className,
}) => {
  return (
    <Card className={cn(className, "pt-4")}>
      <CardTitle className="pl-4">{title}</CardTitle>
      <CardHeader>{date}</CardHeader>
      <CardHeader>{location}</CardHeader>
      <CardHeader className="text-destructive">{deadline}</CardHeader>
      <CardContent>
        <p>{description}</p>
      </CardContent>
      <CardFooter>
        {keywords.map((keyword, index) => (
            <p className="pr-4" key={index}>{keyword}</p>
        ))}
      </CardFooter>
    </Card>
  );
};
