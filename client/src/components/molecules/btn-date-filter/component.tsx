import { ChevronsUpDown } from 'lucide-react';
import * as React from 'react';
import { Button } from '../../../components/ui/button';
import { Command, CommandGroup, CommandItem, CommandList } from '../../../components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';

export type EventCardProps = {
  fcn: React.Dispatch<React.SetStateAction<'upcoming' | 'today' | 'past' | 'all'>>;
};

export const BtnDateFilter: React.FC<EventCardProps> = ({ fcn }) => {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState('All');
  const options = ['All', 'Upcoming', 'Today', 'Past'];
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
              {options.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={(currentValue) => {
                    setValue(currentValue);
                    setOpen(false);
                    fcn(currentValue.toLowerCase() as 'upcoming' | 'today' | 'past' | 'all');
                  }}
                >
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
