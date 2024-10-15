"use client"
import { Button } from "~/components/ui/button"
import {
  Card,
} from "~/components/ui/card"

import * as React from "react"
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons"
import { cn } from "~/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "~/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { splitAndCapitalizeCamelCase } from "../label-formater"
import { Field, FormFields, updateDataByPath } from "../field-renderer"

export function OneOfPicker({ schema, fieldName, hideField = false, required = false, description, formData, setFormData, objectMetadata, path  }: { 
  schema: any, 
  fieldName: string, 
  hideField?: boolean, 
  required?: boolean, 
  description?: string,
  formData: any,
  setFormData: (data: any) => void,
  objectMetadata: any,
  path: string,
}) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")

  const options = Object.keys(schema.properties).map((key: any) => ({
    value: key,
    label: splitAndCapitalizeCamelCase(key),
  }));

  const details = React.useMemo(() => {
    if (!value) {
      return null;
    }

    // clear value from all other options beside the selected one
    let newFormData = formData;
    for (const other of Object.keys(schema.properties).filter(k => k !== value)) {
      const otherPath = path ? `${path}.${other}` : other;
      newFormData = updateDataByPath(newFormData, otherPath, undefined);
    }

    const selectedSchema = schema.properties[value]
    const key = value;
    const selectedPath = path ? `${path}.${key}` : key;

    // TODO (shaib): this doesn't work if the selected schema is a "string" or other primitive.
    // there's an assumption that the selected schema is always an object.

    return (
      <Card className="px-2 py-4 rounded-md" >
        <FormFields
          path={selectedPath}
          hideField={hideField}
          objectMetadata={objectMetadata}
          requiredFields={selectedSchema.required}
          properties={selectedSchema.properties}
          formData={newFormData}
          setFormData={setFormData}
        />
      </Card>
    )
  }, [value, schema, formData, setFormData, objectMetadata, path, hideField]);

  return (
    <Field hideField={hideField} fieldName={fieldName} required={required} description={description}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
          >
            {value
              ? options.find((framework) => framework.value === value)?.label
              : `Select...`}
            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandList>
              <CommandEmpty>No framework found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue)
                      setOpen(false)
                    }}
                  >
                    {option.label}
                    <CheckIcon
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {details}
    </Field>
  )
}


/*

export function TabsDemo() {
  return 
}
*/