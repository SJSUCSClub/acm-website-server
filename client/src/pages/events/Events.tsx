import { useEffect, useState } from "react";
import EventCard from "../../components/molecules/event-card";
import BtnDateFilter from "../../components/molecules/btn-date-filter";

interface Event {
  description: string;
  endDate: string;
  endTime: string;
  id: number;
  location: string;
  name: string;
  startDate: string;
  startTime: string;
  deadline: string;
  eventType: string;
  tags: string[];
}

const CalendarPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [dateFilter, setDateFilter] = useState("all");

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
  useEffect(() => {
    fetch(`http://localhost/api/v1/events?timeframe=${dateFilter}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setEvents(data.foundEvents);
      });
  }, [dateFilter]);
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
          <BtnDateFilter tab1="All" tab2="Upcoming" tab3="Today" tab4="Past" fcn={setDateFilter} />
        </div>
        {events.length === 0 && <div className="text-text text-center my-10">No events found</div>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">
          {events.map((event) => (
            <EventCard
              key={event.id}
              eventType={event.eventType}
              title={event.name}
              date={`${formatDate(event.startDate)} ${formatTime(event.startTime)} - ${formatDate(event.endDate)} ${formatTime(event.endTime)}`}
              location={event.location}
              description={event.description}
              keywords={event.tags}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default CalendarPage;
