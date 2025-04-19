import { ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@/hooks/useFetch';
import { Checkbox } from '@/components/ui/checkbox';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { paths } from '@/types/schema.v1';
import Btn from '@/components/atoms/btn';

export type EventType = paths['/v1/events/{eventID}']['get']['responses']['200']['content']['application/json']['event']['eventType'];
export type EventTypeFilterProps = {
  selectedEventTypes: EventType[];
  onSelectChange: (data: EventType[]) => void;
};

export const BtnEventTypeFilter: React.FC<EventTypeFilterProps> = ({
  onSelectChange,
  selectedEventTypes
}) => {
  const [open, setOpen] = useState(false);
  const value = 'Event Type Filter';
  const { data: eventTypes, error } = useQuery('get', '/v1/enums/{enumType}', {
    params: {
      path: {
        enumType: 'events_enum'
      }
    }
  });

  const handleCheckboxChange = (eventType: EventType, checked: boolean) => {
    if (checked) {
      onSelectChange([...selectedEventTypes, eventType]);
    } else {
      onSelectChange(selectedEventTypes.filter((item) => item !== eventType));
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Btn
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value}
          <ChevronsUpDown className="opacity-50" />
        </Btn>
      </PopoverTrigger>

      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            {error || eventTypes?.types.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-500">No Event Types Found</div>
            ) : (
              <CommandGroup>
                {eventTypes?.types.map((option: string) => (
                  <CommandItem key={option}>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={option}
                        checked={selectedEventTypes.includes(option as EventType)}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(option as EventType, checked as boolean)
                        }
                      />

                      <label htmlFor={option}>{option}</label>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
