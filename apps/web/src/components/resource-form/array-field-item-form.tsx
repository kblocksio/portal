import { useState } from "react";
import { Button } from "../ui/button";
import { FieldRenderer } from "./field-renderer";
import { ObjectMetadata } from "@repo/shared";
import { PrimitiveFieldRenderer } from "./primitive-field-renderer";

interface ArrayFieldItemFormProps {
  fieldName: string;
  schema: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
  objectMetadata: ObjectMetadata;
}

export const ArrayFieldItemForm = ({
  fieldName,
  schema,
  onSave,
  onCancel,
  initialData,
  objectMetadata,
}: ArrayFieldItemFormProps) => {
  const { type } = schema;

  const [itemData, setItemData] = useState<any>(
    initialData ?? (type === "object" ? {} : ""),
  );

  const updateItemData = (newData: any) => {
    setItemData(newData);
  };

  const handleSave = () => {
    onSave(itemData);
  };

  return (
    <div className="w-full">
      <div className="p-1">
        <div className="space-y-6">
          {type === "object" || type === "array" ? (
            <FieldRenderer
              objectMetadata={objectMetadata}
              schema={schema}
              path=""
              formData={itemData}
              updateFormData={updateItemData}
              fieldName={fieldName}
              hideField={true}
              required={schema.required?.includes(fieldName)}
            />
          ) : (
            <PrimitiveFieldRenderer
              type={type}
              handleChange={setItemData}
              value={itemData}
              fieldName={fieldName}
              description={schema?.description}
              required={schema.required?.includes(fieldName)}
              schema={schema}
              objectMetadata={objectMetadata}
            />
          )}
        </div>
        <div className="mt-6 flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" variant="default" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};
