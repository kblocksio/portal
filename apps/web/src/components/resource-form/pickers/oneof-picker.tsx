import { Card } from "@/components/ui/card";
import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { splitAndCapitalizeCamelCase } from "@/lib/utils";
import { FieldRenderer } from "../field-renderer";
import { Field } from "../form-field";
import { updateDataByPath } from "../utils";
import { useMemo } from "react";

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

  const [value, setValue] = React.useState(() => {
    for (const key of Object.keys(properties)) {
      const optionPath = path ? `${path}.${key}` : key;
      const dataAtPath = getDataByPath(formData, optionPath);
      if (dataAtPath !== undefined && dataAtPath !== null) {
        return key;
      }
    }
    return Object.keys(properties)[0] || "";
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
      <Tabs value={value} onValueChange={setValue} className="w-full">
        <TabsList className="flex w-full gap-2">
          {options.map((option) => (
            <TabsTrigger
              key={option.value}
              value={option.value}
              className="flex-1"
            >
              {option.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {options.map((option) => (
          <TabsContent key={option.value} value={option.value}>
            {value === option.value && details}
          </TabsContent>
        ))}
      </Tabs>
    </Field>
  );
};
