import Btn from '@/components/atoms/btn';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { paths } from '@/types/schema.v1';
import { formatDate, formatTime } from '@/utils/formatter';
import { Link } from '@tanstack/react-router';
import React from 'react';

type Event =
  paths['/v1/events']['get']['responses']['200']['content']['application/json']['foundEvents'][number];
export interface IEventsTableProps {
  events: Event[];
}

const EventsTable: React.FC<IEventsTableProps> = ({ events }) => {
  return (
    <div>
      {events.length === 0 ? (
        <div className="text-text text-center my-10">No events found</div>
      ) : (
        <Table className="overflow-x-auto border rounded-md">
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Timing</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Member Only</TableHead>
              <TableHead className="w-[20px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell>{event.name}</TableCell>
                <TableCell>
                  {formatDate(event.startDate)} - {formatDate(event.endDate)}
                </TableCell>
                <TableCell>
                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                </TableCell>
                <TableCell>{event.eventType}</TableCell>
                <TableCell>{event.memberOnly ? 'Yes' : 'No'}</TableCell>
                <TableCell>
                  <Link to="/events/$eventId" params={{ eventId: event.id.toString() }}>
                    <Btn variant="outline">Open</Btn>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export { EventsTable };
