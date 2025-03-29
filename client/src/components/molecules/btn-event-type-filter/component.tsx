import { ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@/hooks/useFetch';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export type EventTypeFilterProps = {
  selectedEventTypes: string[];
  fcn: (data: string[]) => void;
};

export const BtnEventTypeFilter: React.FC<EventTypeFilterProps> = ({ fcn, selectedEventTypes }) => {
  const [open, setOpen] = useState(false);
  const value = 'Event Type Filter';
  const { data: eventTypes } = useQuery('get', '/v1/enums/{enumType}', {
    params: {
      path: {
        enumType: 'events_enum'
      }
    }
  });

  const handleCheckboxChange = (eventType: string, checked: boolean) => {
    if (checked) {
      fcn([...selectedEventTypes, eventType]);
    } else {
      fcn(selectedEventTypes.filter((item) => item !== eventType));
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {eventTypes?.types.map((option: string) => (
                <CommandItem key={option}>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={option}
                      checked={selectedEventTypes.includes(option)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange(option, checked as boolean)
                      }
                    />

                    <label htmlFor={option}>{option}</label>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
