import CalendarEmbed from './CalendarEmbed';

const EventsPage = () => {
  const [events, setEvents] = useState<Events>([]);
  const [dateFilter, setDateFilter] = useState<dateOptions>("all");
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
      <div className="flex flex-col mt-5 ml-40 space-y-4">
        <h1 className="font-bold text-4xl"> Upcoming Events</h1>
        <h2>
          Our student group organizes a variety of events during each academic semester, including
          workshops, informational sessions, community engagement activities, and much more!
        </h2>
        <h3 className="font-bold">
          These events are accessible to all those who are interested, irrespective of their major
          or prior experience.
        </h3>
      </div>
      <div className="mt-5 mb-5 flex place-content-center">
        <CalendarEmbed />
      </div>
    </>
  );
};

export default EventsPage;
