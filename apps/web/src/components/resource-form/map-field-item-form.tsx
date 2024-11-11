import { useState } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { InputField } from "./input-field";
import { FieldRenderer } from "./field-renderer";
import { ObjectMetadata } from "@repo/shared";

interface MapFieldItemFormProps {
  fieldName: string;
  schema: any;
  onSave: (key: string, value: any) => void;
  onCancel: () => void;
  initialKey?: string;
  initialData?: any;
  objectMetadata: ObjectMetadata;
}

export const MapFieldItemForm = ({
  fieldName,
  schema,
  onSave,
  onCancel,
  initialKey,
  initialData,
  objectMetadata,
}: MapFieldItemFormProps) => {
  const { type } = schema;

  const [key, setKey] = useState<string>(initialKey || "");
  const [valueData, setValueData] = useState<any>(
    initialData ?? (type === "object" ? {} : ""),
  );

  const updateValueData = (newData: any) => {
    setValueData(newData);
  };

  const handleSave = () => {
    onSave(key, valueData);
  };

  return (
    <div className="w-full">
      <div className="space-y-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-2 pb-2">
            <Label htmlFor="map-key" className="text-sm font-medium">
              Key
            </Label>
            <InputField
              value={key}
              onChange={(value) => setKey(value as string)}
              required={true}
              type="string"
              placeholder="Enter key"
            />
          </div>
          <div className="flex-1">
            <FieldRenderer
              objectMetadata={objectMetadata}
              schema={schema}
              path=""
              formData={valueData}
              updateFormData={updateValueData}
              fieldName={fieldName}
              required={schema.required?.includes(fieldName)}
            />
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="button"
          disabled={!key}
          variant="default"
          onClick={handleSave}
        >
          Save
        </Button>
      </div>
    </div>
  );
};
