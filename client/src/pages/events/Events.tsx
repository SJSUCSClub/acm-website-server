import { useEffect, useState } from "react";
import EventCard from "../../components/molecules/event-card";

interface Event {
  id: number;
  title: string;
  date: string;
  description: string;
  location: string;
  deadline: string;
  presenter: string;
  eventType: string;
  keywords: string[];
}

const mockEvents: Event[] = [
  {
    id: 1,
    eventType: "Event",
    title: "This is a blank slate",
    date: "Nov 28, 2023, 9:00 AM - 12:00 PM",
    description:
      "Cloud Hero gets a room full of people competing head-to-head, with a live play-by-play leaderboard and lots of prizes. To date, over 1,000 players have played Cloud Hero at 12 public events like Google Cloud Next and Google Cloud Summits—with more venues on the way!",
    location: "1 Washington Sq, San Jose, CA 95192",
    presenter: "John Doe",
    deadline: "Nov 27, 2023, 12:00 PM",
    keywords: ["Undergraduate", "Javascript", "HTML", "CSS", "Networking"],
  },
  {
    id: 2,
    eventType: "Event",
    title: "This is a blank slate",
    date: "Nov 28, 2023, 9:00 AM - 12:00 PM",
    description:
      "Cloud Hero gets a room full of people competing head-to-head, with a live play-by-play leaderboard and lots of prizes. To date, over 1,000 players have played Cloud Hero at 12 public events like Google Cloud Next and Google Cloud Summits—with more venues on the way!",
    location: "1 Washington Sq, San Jose, CA 95192",
    presenter: "John Doe",
    deadline: "Nov 27, 2023, 12:00 PM",
    keywords: ["Undergraduate", "Javascript", "HTML", "CSS", "Networking"],
  },
  {
    id: 3,
    eventType: "Event",
    title: "This is a blank slate",
    date: "Nov 28, 2023, 9:00 AM - 12:00 PM",
    description:
      "Cloud Hero gets a room full of people competing head-to-head, with a live play-by-play leaderboard and lots of prizes. To date, over 1,000 players have played Cloud Hero at 12 public events like Google Cloud Next and Google Cloud Summits—with more venues on the way!",
    location: "1 Washington Sq, San Jose, CA 95192",
    presenter: "John Doe",
    deadline: "Nov 27, 2023, 12:00 PM",
    keywords: ["Undergraduate", "Javascript", "HTML", "CSS", "Networking"],
  },
  {
    id: 4,
    eventType: "Event",
    title: "This is a blank slate",
    date: "Nov 28, 2023, 9:00 AM - 12:00 PM",
    description:
      "Cloud Hero gets a room full of people competing head-to-head, with a live play-by-play leaderboard and lots of prizes. To date, over 1,000 players have played Cloud Hero at 12 public events like Google Cloud Next and Google Cloud Summits—with more venues on the way!",
    location: "1 Washington Sq, San Jose, CA 95192",
    presenter: "John Doe",
    deadline: "Nov 27, 2023, 12:00 PM",
    keywords: ["Undergraduate", "Javascript", "HTML", "CSS", "Networking"],
  },
  {
    id: 5,
    eventType: "Event",
    title: "This is a blank slate",
    date: "Nov 28, 2023, 9:00 AM - 12:00 PM",
    description:
      "Cloud Hero gets a room full of people competing head-to-head, with a live play-by-play leaderboard and lots of prizes. To date, over 1,000 players have played Cloud Hero at 12 public events like Google Cloud Next and Google Cloud Summits—with more venues on the way!",
    location: "1 Washington Sq, San Jose, CA 95192",
    presenter: "John Doe",
    deadline: "Nov 27, 2023, 12:00 PM",
    keywords: ["Undergraduate", "Javascript", "HTML", "CSS", "Networking"],
  },
  {
    id: 6,
    eventType: "Event",
    title: "This is a blank slate",
    date: "Nov 28, 2023, 9:00 AM - 12:00 PM",
    description:
      "Cloud Hero gets a room full of people competing head-to-head, with a live play-by-play leaderboard and lots of prizes. To date, over 1,000 players have played Cloud Hero at 12 public events like Google Cloud Next and Google Cloud Summits—with more venues on the way!",
    location: "1 Washington Sq, San Jose, CA 95192",
    presenter: "John Doe",
    deadline: "Nov 27, 2023, 12:00 PM",
    keywords: ["Undergraduate", "Javascript", "HTML", "CSS", "Networking"],
  },
];

const CalendarPage = () => {
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
          <BtnDateFilter
            fcn={setDateFilter}
          />
          <BtnTagFilter selectedTags={tagFilter} fcn={setTagFilter} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">
          {mockEvents.map((event) => (
            <EventCard
              key={event.id}
              eventType={event.eventType}
              name={event.name}
              startDate={event.startDate}
              endDate={event.endDate}
              startTime={event.startTime}
              endTime={event.endTime}
              location={event.location}
              description={event.description}
              tags={event.tags}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default EventsPage;
