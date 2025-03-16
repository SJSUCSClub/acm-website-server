import React from "react";
import Page from "@/components/templates/Page";
import { Route } from "@/routes/events/$eventId";
import Btn from "@/components/atoms/btn";
import { Bookmark, Calendar, Clock, MapPin, Share2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";
import FilesTable from "@/components/molecules/files-table";
import CompanyDialog from "@/components/molecules/company-dialog";
import { useQuery } from "@/hooks/useFetch";
import SubscribeBtn from "@/components/molecules/subscribe-btn";
import AttendBtn from "@/components/molecules/attend-btn";
import BookmarkIcon from "@/components/molecules/bookmark-icon";

const event = {
  id: 1,
  createdAt: "2024-03-10T12:00:00Z",
  name: "Tech Conference 2024",
  location: "San Francisco Convention Center",
  start_date: "2024-04-15",
  end_date: "2024-04-17",
  description:
    "Join us for the biggest tech conference of the year. Network with industry leaders, attend workshops, and learn about the latest technologies.",
  urls: ["https://techconf2024.com", "https://techconf2024.com/schedule"],
  event_type: "CONFERENCE",
  event_capacity: 500,
  image: "tech-conference.jpg",
  start_time: "09:00:00",
  end_time: "18:00:00",
  tags: ["AI", "MACHINE_LEARNING", "WEB_DEVELOPMENT", "CLOUD_COMPUTING"],
  target_audience: "PROFESSIONALS",
  member_only: false,
  companies: [
    {
      id: 1,
      name: "TechCorp",
      location: "San Francisco, CA",
      description:
        "Leading technology solutions provider specializing in AI and cloud services.",
      industryId: "Technology",
      logo: "techcorp-logo.jpg",
    },
    {
      id: 2,
      name: "DataSystems",
      location: "Seattle, WA",
      description:
        "Data analytics and machine learning solutions for enterprise clients.",
      industryId: "Technology",
      logo: "datasystems-logo.jpg",
    },
    {
      id: 3,
      name: "CloudNine",
      location: "Austin, TX",
      description:
        "Cloud infrastructure and platform services for businesses of all sizes.",
      industryId: "Technology",
      logo: "cloudnine-logo.jpg",
    },
  ],
  files: [
    {
      key: "schedule-pdf",
      name: "Conference Schedule.pdf",
      createdAt: "2024-03-01T10:30:00Z",
    },
    {
      key: "speakers-list",
      name: "Speakers List.docx",
      createdAt: "2024-03-05T14:15:00Z",
    },
    {
      key: "venue-map",
      name: "Venue Map.jpg",
      createdAt: "2024-03-08T09:45:00Z",
    },
  ],
};

const EventsDetails = () => {
  const { eventId } = Route.useParams();
  const { data: event } = useQuery("get", "/v1/events/{eventID}", {
    params: {
      path: {
        eventID: eventId,
      },
    },
  });
  const { data: eventCompanies } = useQuery(
    "get",
    "/v1/events/{eventID}/companies",
    {
      params: {
        path: {
          eventID: eventId,
        },
      },
    },
  );
  const { data: eventFiles } = useQuery("get", "/v1/events/{eventID}/files", {
    params: {
      path: {
        eventID: eventId,
      },
    },
  });
  const { data: attendeeCount } = useQuery(
    "get",
    "/v1/events/{eventID}/attendance/count",
    {
      params: {
        path: {
          eventID: eventId,
        },
      },
    },
  );
  console.log(event);

  return (
    <Page>
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content - 2/3 width on large screens */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event header with image */}
            <div className="relative rounded-xl overflow-hidden">
              <img
                src={event?.event.image}
                alt={event?.event.image}
                className="w-full h-full aspect-[3/2] object-cover"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <BookmarkIcon id={eventId} />
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl font-bold">{event?.event.name}</h1>
              {/* Tags */}
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {event?.event.memberOnly && (
                    <Badge variant="destructive">Members Only</Badge>
                  )}
                  <Badge variant="outline">{event?.event.eventType}</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {event?.event.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Event title and basic info */}
              <div className="flex flex-col gap-3 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span>
                    {event?.event.startDate}-{event?.event.endDate}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>
                    {event?.event.startTime} - {event?.event.endTime}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>{event?.event.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>
                    Audience: {event?.event.targetAudience || "Everyone"}
                  </span>
                </div>
                {event?.event.eventCapacity && (
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span>
                      Capacity: {event?.event.eventCapacity} attendees
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span>
                    Attending: {attendeeCount?.attendeesCount} attendees
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold mb-3">About this event</h2>
              <p className="text-muted-foreground whitespace-pre-line">
                {event?.event.description}
              </p>
            </div>

            {/* URLs */}
            {event && event.event.urls.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-3">Event Links</h2>
                <ul className="list-disc list-inside space-y-1 text-primary">
                  {event.event.urls.map((url, index) => (
                    <li key={index}>
                      <Link
                        to={url}
                        target="_blank"
                        className="hover:underline"
                      >
                        {url.replace(/^https?:\/\//, "")}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Files */}
            {eventFiles && eventFiles.eventFiles.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-3">Event Files</h2>
                <FilesTable files={eventFiles.eventFiles} />
              </div>
            )}
          </div>

          {/* Sidebar - 1/3 width on large screens */}
          <div className="space-y-8">
            {/* Action buttons */}
            <div className="bg-muted p-6 rounded-xl space-y-4">
              <SubscribeBtn source="event" id={eventId} />
              <AttendBtn id={eventId} />
            </div>

            {/* Companies */}
            {eventCompanies && (
              <div className="bg-muted p-6 rounded-xl">
                <h2 className="text-xl font-semibold mb-4">
                  Participating Companies
                </h2>
                <div className="space-y-4">
                  {eventCompanies.eventCompanies.map((company) => (
                    <CompanyDialog key={company.id} company={company} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Page>
  );
};

export default EventsDetails;
