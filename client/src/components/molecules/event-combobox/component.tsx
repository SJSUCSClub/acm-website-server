import Btn from '@/components/atoms/btn';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useQuery } from '@/hooks/useFetch';
import { Check, ChevronsUpDown } from 'lucide-react';
import React, { useState } from 'react';
import FetchError from '@/components/molecules/fetch-error';
import Loading from '@/components/molecules/loading';
import { cn } from '@/utils/cn';

export interface IEventComboboxProps {
  selectedId: number | null;
  onSelectChange: (eventId: number) => void;
}

const EventCombobox: React.FC<IEventComboboxProps> = ({ selectedId, onSelectChange }) => {
  const [open, setOpen] = useState(false);
  const { data, isLoading, error } = useQuery('get', '/v1/events');

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Btn
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedId
            ? data?.foundEvents.find((event) => event.id === selectedId)?.name
            : 'Select event...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Btn>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Loading isLoading={isLoading}>
          <FetchError isError={!!error || !data}>
            <Command>
              <CommandInput placeholder="Search event..." />
              <CommandList>
                <CommandEmpty>No event found.</CommandEmpty>
                <CommandGroup>
                  {data?.foundEvents.map((event) => (
                    <CommandItem
                      key={event.id}
                      value={event.name}
                      onSelect={(currentValue) => {
                        const eventId = data?.foundEvents.find(
                          (event) => event.name === currentValue
                        )?.id;
                        if (!eventId) return;
                        onSelectChange(eventId);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          selectedId === event.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <strong>{event.name}</strong> - {event.eventType}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </FetchError>
        </Loading>
      </PopoverContent>
    </Popover>
  );
};

export { EventCombobox };
