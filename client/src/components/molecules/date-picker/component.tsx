import * as React from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { cn } from '../../../utils/cn';
import { Btn } from '../../atoms/btn';
import { Calendar } from '../../molecules/calendar';

import { Popover, PopoverContent, PopoverTrigger } from '../../atoms/popover';

interface DatePickerProps {
  label: string;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
}

export function DatePicker({ label, value, onChange }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (selectedDate: Date | undefined) => {
    setOpen(false);
    if (onChange) {
      onChange(selectedDate);
    }
  };

  return (
    <div className="flex flex-col">
      <p className="text-neutral font-semibold mb-2 text-[14px]">{label}</p>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Btn
            variant={'outline'}
            className={cn(
              'w-[280px] justify-start text-left font-normal',
              !value && 'text-muted-foreground'
            )}
            onClick={() => setOpen(true)}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, 'PPP') : <span>Pick a date</span>}
          </Btn>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleSelect}
            disabled={(date) => date < new Date('1900-01-01')}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
