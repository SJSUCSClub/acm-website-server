import EventCard from "../../components/molecules/event-card";

interface Event {
  id: number;
  title: string;
  date: string;
  description: string;
  location: string;
  deadline: string;
  keywords: string[];
}

const mockEvents: Event[] = [
  {
    id: 1,
    title: "Intro to Web Development",
    date: "2024-04-01",
    description: "Learn the basics of HTML, CSS, and JavaScript",
    location: "CS Building Room 101",
    deadline: "2024-03-30",
    keywords: ["web", "html", "css", "javascript", "beginner"],
  },
  {
    id: 2,
    title: "Hackathon Workshop",
    date: "2024-04-15",
    description: "Prepare for upcoming hackathons",
    location: "Engineering Hall",
    deadline: "2024-04-14",
    keywords: ["hackathon", "coding", "teamwork"],
  },
  {
    id: 3,
    title: "Resume Review Session",
    date: "2024-04-30",
    description: "Get your tech resume reviewed by industry professionals",
    location: "Virtual",
    deadline: "2024-04-28",
    keywords: ["career", "professional", "resume"],
  },
];

// interface Event {
//   description: string;
//   endDate: string;
//   endTime: string;
//   id: number;
//   location: string;
//   name: string;
//   startDate: string;
//   startTime: string;
//   deadline: string;
//   eventType: string;
//   tags: string[];
// }

type Events = paths["/v1/events"]["get"]["responses"]["200"]["content"]["application/json"]["foundEvents"];

const EventsPage = () => {
  const [events, setEvents] = useState<Events>([]);
  const [dateFilter, setDateFilter] = useState<"upcoming" | "today" | "past" | "all">("all");
  const [tagFilter, setTagFilter] = useState<string[]>([]);



  const { data: eventData } = useQuery(
      "get",
      "/v1/events",
      {
        params: {
          query: {
            "tags": tagFilter.join(",") || "",
            "timeframe": dateFilter || "all"
          },
        },
      },
    )  



  useEffect(() => {
    if (eventData) {
      setEvents(eventData.foundEvents);
    }
  }, [dateFilter, tagFilter, eventData]);
  return (
    <>
      <div className="about text-text my-10 px-[15%]">
        <div className="intro space-y-4">
          <h1 className="text-4xl font-bold">Events</h1>
          <p className="text-lg">
            Our student group organizes a variety of events during each academic
            semester, including workshops, informational sessions, community
            engagement activities, and much more!
          </p>
          <p>
            These events are accessible to all those who are interested,
            irrespective of their major or prior experience.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
          {mockEvents.map((event) => (
            <EventCard
              key={event.id}
              title={event.title}
              date={event.date}
              location={event.location}
              description={event.description}
              deadline={event.deadline}
              keywords={event.keywords}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default EventsPage;
