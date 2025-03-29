import { ChevronsUpDown } from 'lucide-react';
import * as React from 'react';
import { useQuery } from '@/hooks/useFetch';
import { Button } from '@/components/ui/button';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export type TargetAudienceFilterProps = {
  fcn: (targetAudience: string) => void;
  targetAudience: string;
};

export const BtnTargetAudienceFilter: React.FC<TargetAudienceFilterProps> = ({
  fcn,
  targetAudience
}) => {
  const [open, setOpen] = React.useState(false);
  const { data } = useQuery('get', '/v1/enums/{enumType}', {
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
          Audience: {targetAudience}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {targetAudiences.map((targetAudience) => (
                <CommandItem
                  key={targetAudience}
                  value={targetAudience}
                  onSelect={(currentValue) => {
                    setOpen(false);
                    fcn(currentValue);
                  }}
                >
                  {targetAudience}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
