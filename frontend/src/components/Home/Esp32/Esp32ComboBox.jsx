import { useEffect, useRef, useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/shadcn/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/shadcn/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/shadcn/popover"

const Esp32ComboBox = (props) => {
  const { data, defaultValue, handleESP32StateChange, type } = props;
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(data[defaultValue]);

  const isMounted = useRef(false);

  useEffect(() => {
    if (isMounted.current && data[defaultValue] !== value) {
      handleESP32StateChange(type, value);
    } else {
      isMounted.current = true;
    }
  }, [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? data.find((dataValue) => dataValue === value)
            : "Select dataValue..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search dataValues..." className="h-9" />
          <CommandList>
            <CommandEmpty>No dataValue found.</CommandEmpty>
            <CommandGroup>
              {data.map((dataValue, index) => (
                <CommandItem
                  key={index}
                  value={dataValue}
                  onSelect={(currentValue) => {
                    if (currentValue !== value) setValue(currentValue);
                    setOpen(false);
                  }}
                >
                  {`${index} - ${dataValue}`}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === dataValue ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default Esp32ComboBox