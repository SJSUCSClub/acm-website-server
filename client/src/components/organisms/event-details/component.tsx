import React from "react";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import FilesTable, { Files } from "@/components/molecules/files-table";
import CompanyDialog from "@/components/molecules/company-dialog";
import SubscribeBtn from "@/components/molecules/subscribe-btn";
import AttendBtn from "@/components/molecules/attend-btn";
import BookmarkIcon from "@/components/molecules/bookmark-icon";
import { paths } from "@/types/schema.v1";
import { formatDate, formatTime } from "@/utils/formatter";

type Event =
  paths["/v1/events/{eventID}"]["get"]["responses"]["200"]["content"]["application/json"]["event"];
type Companies =
  paths["/v1/events/{eventID}/companies"]["get"]["responses"]["200"]["content"]["application/json"]["eventCompanies"];

interface IEventDetailsProps {
  event: Event;
  companies: Companies;
  files: Files;
  attendeeCount: number;
}

const EventDetails: React.FC<IEventDetailsProps> = ({
  event,
  companies,
  files,
  attendeeCount,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <div className="relative rounded-xl overflow-hidden">
          <img
            src={event.image}
            alt={event.image}
            className="w-full h-full aspect-[3/2] object-cover"
          />
          <div className="absolute top-4 right-4 flex gap-2">
            <BookmarkIcon id={event.id.toString()} />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{event.name}</h1>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {event.memberOnly && (
                <Badge variant="destructive">Members Only</Badge>
              )}
              <Badge variant="outline">{event.eventType}</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {event.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>
                {formatDate(event.startDate)}  -  {formatDate(event.endDate)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span>
                {formatTime(event.startTime)}  -  {formatTime(event.endTime)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span>Audience: {event.targetAudience || "Everyone"}</span>
            </div>
            {event.eventCapacity !== null && (
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span>Capacity: {event.eventCapacity} attendees</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span>Attending: {attendeeCount} attendees</span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">About this event</h2>
          <p className="text-muted-foreground whitespace-pre-line">
            {event.description}
          </p>
        </div>

        {event.urls.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-3">Event Links</h2>
            <ul className="list-disc list-inside space-y-1 text-primary">
              {event.urls.map((url, index) => (
                <p key={index} className="text-blue-400">
                  <a href={url} target="_blank" className="hover:underline">
                    {url}
                  </a>
                </p>
              ))}
            </ul>
          </div>
        )}

        {files.length > 0 && <FilesTable files={files} />}
      </div>

      <div className="space-y-8">
        <div className="bg-muted p-6 rounded-xl space-y-4">
          <SubscribeBtn source="event" id={event.id.toString()} />
          <AttendBtn
            id={event.id.toString()}
            full={
              event.eventCapacity !== null &&
              attendeeCount >= event.eventCapacity
            }
          />
        </div>

        {companies.length > 0 && (
          <div className="bg-muted p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">
              Participating Companies
            </h2>
            <div className="space-y-4">
              {companies.map((company) => (
                <CompanyDialog key={company.id} company={company} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { EventDetails };
