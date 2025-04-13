import { ChevronsUpDown } from 'lucide-react';
import * as React from 'react';
import { useQuery } from '@/hooks/useFetch';
import { Button } from '@/components/ui/button';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export type TargetAudienceFilterProps = {
  onSelectChange: (targetAudience: string) => void;
};

export const BtnTargetAudienceFilter: React.FC<TargetAudienceFilterProps> = ({
  onSelectChange
}) => {
  const [open, setOpen] = React.useState(false);
  const { data, error } = useQuery('get', '/v1/enums/{enumType}', {
    params: {
      path: {
        enumType: 'target_audience_enum'
      }
    }
  });

  const targetAudiences = data ? ['All', ...data.types] : [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          Audience Filter
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            {error || targetAudiences.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-500">No Audiences Found</div>
            ) : (
              <CommandGroup>
                {targetAudiences.map((targetAudience) => (
                  <CommandItem
                    key={targetAudience}
                    value={targetAudience}
                    onSelect={(currentValue) => {
                      setOpen(false);
                      onSelectChange(currentValue);
                    }}
                  >
                    {targetAudience}
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
