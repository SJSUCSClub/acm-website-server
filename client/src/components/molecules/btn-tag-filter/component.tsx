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
import { useEffect, useState } from "react";

export type EventCardProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fcn: any;
};

export const BtnTagFilter: React.FC<EventCardProps> = ({ fcn }) => {
  const [open, setOpen] = React.useState(false);
  const [value] = React.useState("Tag Filter");
  const [selected, setSelected] = React.useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    // Fetch enums only once on mount
    fetch("http://localhost/api/v1/enums/cs_fields_enum", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setTags(data.types);
      });
  }, []);

  const handleCheckboxChange = (tag: string, checked: boolean) => {
    if (checked) {
      setSelected([...selected, tag]);
      fcn([...selected, tag]);
    } else {
      setSelected(selected.filter((item) => item !== tag));
      fcn(selected.filter((item) => item !== tag));
      console.log(selected);
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
              {tags.map((option) => (
                <CommandItem key={option}>
                  {" "}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={option}
                      checked={selected.includes(option)}
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
