import { ChevronsUpDown } from 'lucide-react';
import * as React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useState } from 'react';
import { useQuery } from '@/hooks/useFetch';
import { paths } from '@/types/schema.v1';
import Btn from '@/components/atoms/btn';

export type Tag =
  paths['/v1/events/{eventID}']['get']['responses']['200']['content']['application/json']['event']['tags'][number];
export type EventCardProps = {
  selectedTags: Tag[];
  onSelectChange: (data: Tag[]) => void;
};

export const BtnTagFilter: React.FC<EventCardProps> = ({ selectedTags, onSelectChange }) => {
  const [open, setOpen] = useState(false);
  const { data: tags, error } = useQuery('get', '/v1/enums/{enumType}', {
    params: {
      path: {
        enumType: 'cs_fields_enum'
      }
    }
  });

  const handleCheckboxChange = (tag: Tag, checked: boolean) => {
    if (checked) {
      onSelectChange([...selectedTags, tag]);
    } else {
      onSelectChange(selectedTags.filter((item) => item !== tag));
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Btn
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          Tag Filter
          <ChevronsUpDown className="opacity-50" />
        </Btn>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandList>
            {error || tags?.types.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-500">No Tags Found</div>
            ) : (
              <CommandGroup>
                {tags?.types.map((option: string) => (
                  <CommandItem key={option}>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={option}
                        checked={selectedTags.includes(option as Tag)}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(option as Tag, checked as boolean)
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
