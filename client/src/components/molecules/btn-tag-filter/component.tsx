import { ChevronsUpDown } from "lucide-react";
import * as React from "react";
import { Checkbox } from "../../../components/ui/checkbox";
import { Button } from "../../../components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "../../../components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";
import { useState } from "react";
import { useQuery } from "@/hooks/useFetch";

export type EventCardProps = {
  selectedTags: string[] ;
  fcn: (data: string[]) => void;
};

export const BtnTagFilter: React.FC<EventCardProps> = ({ selectedTags, fcn }) => {
  const [open, setOpen] = useState(false);
  const { data: tags } = useQuery(
    "get",
    "/v1/enums/{enumType}",
    {
      params: {
        path: {
          enumType: "cs_fields_enum",
        },
      },
    }
  )  

  const handleCheckboxChange = (tag: string, checked: boolean) => {
    if (checked) {
      fcn([...selectedTags, tag]);
    } else {
      fcn(selectedTags.filter((item) => item !== tag));
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
          Tag Filter
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {tags?.types.map((option:  string) => (
                <CommandItem key={option}>
                  {" "}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={option}
                      checked={selectedTags.includes(option)}
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
