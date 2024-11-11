import { useState, useMemo } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { ResourceType } from "@/resource-context";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "../ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import { cn } from "@/lib/utils";

export const SystemSelector = ({
  value,
  resourceType,
  onChange,
  disabled,
  required,
}: {
  resourceType: ResourceType;
  disabled: boolean;
  value?: string;
  required?: boolean;
  onChange: (value: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const systems = useMemo(
    () => Array.from(resourceType.systems),
    [resourceType],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          role="combobox"
          aria-expanded={open}
          aria-required={required}
          className={cn(
            "w-full justify-between",
            disabled && "cursor-not-allowed",
          )}
        >
          <span className="truncate">{value || "Select a cluster"}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="pointer-events-auto w-[350px] p-0"
        style={{ zIndex: 1000 }}
      >
        <Command>
          <CommandInput placeholder="Search clusters..." />
          <CommandList>
            <CommandEmpty>No cluster found.</CommandEmpty>
            <CommandGroup>
              {systems.map((system) => (
                <CommandItem
                  key={system}
                  value={system}
                  onSelect={() => onChange(system)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === system ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {system}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
