import { ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export type MemberOnlyFilterProps = {
  fcn: (targetAudience: boolean) => void;
  memberOnly: boolean;
};

export const BtnMemberOnlyFilter: React.FC<MemberOnlyFilterProps> = ({ fcn, memberOnly }) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          Member Only: {memberOnly ? 'Yes' : 'No'}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              <CommandItem
                value={'No'}
                onSelect={() => {
                  setOpen(false);
                  fcn(false);
                }}
              >
                No
              </CommandItem>

              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  fcn(true);
                }}
              >
                Yes
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
