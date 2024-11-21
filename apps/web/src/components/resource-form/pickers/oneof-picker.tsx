import { Card } from "@/components/ui/card";
import * as React from "react";
import { cn, splitAndCapitalizeCamelCase } from "@/lib/utils";
import { FieldRenderer } from "../field-renderer";
import { Field } from "../form-field";
import { updateDataByPath } from "../utils";
import { useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Command,
  CommandList,
  CommandItem,
  CommandGroup,
} from "@/components/ui/command";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";

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
  const properties = useMemo(() => schema?.properties || {}, [schema]);

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

  const [value, setValue] = React.useState<string | null>(() => {
    for (const key of Object.keys(properties)) {
      const optionPath = path ? `${path}.${key}` : key;
      const dataAtPath = getDataByPath(formData, optionPath);
      if (dataAtPath !== undefined && dataAtPath !== null) {
        return key;
      }
    }
    return null;
  });

  const [open, setOpen] = React.useState(false);

  const options = Object.keys(properties).map((key: any) => ({
    value: key,
    label: splitAndCapitalizeCamelCase(key),
  }));

  // only update initial value if it's not set
  useEffect(() => {
    if (value) {
      const selectedOptionPath = path ? `${path}.${value}` : value;
      const currentData = getDataByPath(formData, selectedOptionPath);
      // Only update if there's no data set at this path
      if (currentData === undefined || currentData === null) {
        const updatedFormData = updateDataByPath(
          formData,
          selectedOptionPath,
          undefined,
        );

        setFormData(updatedFormData);
      }
    }
  }, [value, path, formData, setFormData]);

  const details = useMemo(() => {
    if (!value) {
      return <AnimatePresence mode="wait"></AnimatePresence>;
    }

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
      <AnimatePresence mode="wait">
        {/* Animate exit before entering new content */}
        <motion.div
          key={value} // Unique key triggers exit and enter animations on value change
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ height: { duration: 0.4 }, opacity: { duration: 0.2 } }}
        >
          <Card className="rounded-md px-4 pb-0 pt-4 shadow-sm">
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
        </motion.div>
      </AnimatePresence>
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
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-required={required}
            className={cn("w-[350px] justify-between")}
          >
            <span className="truncate">
              {options.find((o) => o.value === value)?.label || "Select..."}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="pointer-events-auto w-[350px] p-0"
          style={{ zIndex: 1000 }}
        >
          <Command>
            <CommandList>
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setValue(null); // Clears the current selection
                    setFormData(updateDataByPath(formData, path, undefined));
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === null ? "opacity-100" : "opacity-0",
                    )}
                  />
                  None
                </CommandItem>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      setValue(option.value);
                      const selectedOptionPath = path
                        ? `${path}.${option.value}`
                        : option.value;
                      let updatedFormData = updateDataByPath(
                        formData,
                        selectedOptionPath,
                        undefined, // initial value
                      );
                      for (const other of Object.keys(properties).filter(
                        (k) => k === value,
                      )) {
                        const otherPath = path ? `${path}.${other}` : other;
                        updatedFormData = updateDataByPath(
                          updatedFormData,
                          otherPath,
                          undefined,
                        );
                      }
                      setFormData(updatedFormData);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {option.label}
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
