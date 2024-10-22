import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";

import * as React from "react";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { cn } from "~/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { splitAndCapitalizeCamelCase } from "../label-formater";
import { FieldRenderer } from "../field-renderer";
import { Field } from "../form-field";
import { updateDataByPath } from "../utils";
export const OneOfPicker = ({
  schema,
  fieldName,
  hideField = false,
  required = false,
  description,
  formData,
  setFormData,
  objectMetadata,
  path,
}: {
  schema: any;
  fieldName: string;
  hideField?: boolean;
  required?: boolean;
  description?: string;
  formData: any;
  setFormData: (data: any) => void;
  objectMetadata: any;
  path: string;
}) => {
  const [open, setOpen] = React.useState(false);

  const getDataByPath = (data: any, path: string) => {
    if (!path) return data;
    return path
      .split(".")
      .reduce(
        (acc: any, part: string) =>
          acc && acc[part] !== undefined ? acc[part] : undefined,
        data,
      );
  };

  const properties = schema?.properties || {};

  const [value, setValue] = React.useState(() => {
    for (const key of Object.keys(properties)) {
      const optionPath = path ? `${path}.${key}` : key;
      const dataAtPath = getDataByPath(formData, optionPath);
      if (dataAtPath !== undefined && dataAtPath !== null) {
        return key;
      }
    }
    return "";
  });

  const options = Object.keys(properties).map((key: any) => ({
    value: key,
    label: splitAndCapitalizeCamelCase(key),
  }));

  const details = React.useMemo(() => {
    if (!value) {
      return null;
    }

    // Clear values from all other options besides the selected one
    let newFormData = formData;
    for (const other of Object.keys(properties).filter((k) => k !== value)) {
      const otherPath = path ? `${path}.${other}` : other;
      newFormData = updateDataByPath(newFormData, otherPath, undefined);
    }

    const selectedSchema = properties[value];
    if (!selectedSchema) {
      return null;
    }
    const key = value;
    const selectedPath = path ? `${path}.${key}` : key;

    return (
      <Card className="rounded-md px-4 pb-0 pt-4">
        <FieldRenderer
          path={selectedPath}
          hideField={hideField}
          objectMetadata={objectMetadata}
          required={selectedSchema.required}
          schema={selectedSchema}
          formData={newFormData}
          updateFormData={setFormData}
          inline={true}
          fieldName={fieldName}
        />
      </Card>
    );
  }, [
    formData,
    properties,
    objectMetadata,
    path,
    fieldName,
    hideField,
    setFormData,
    value,
  ]);

  return (
    <Field
      hideField={hideField}
      fieldName={fieldName}
      required={required}
      description={description}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <div className="flex flex-row items-center gap-2">
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[200px] justify-between"
            >
              {value
                ? options.find((option) => option.value === value)?.label
                : `Select...`}
              <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
        </div>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandList>
              <CommandEmpty>No options.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                  >
                    {option.label}
                    <CheckIcon
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0",
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
  );
};
