import { ObjectMetadata } from "@kblocks-portal/shared";
import { Button } from "../ui/button";
import { useState } from "react";
import { FormFields } from "./form-fields";

interface ObjectFormProps {
  properties: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
  hideField?: boolean;
  requiredFields?: string[];
  objectMetadata: ObjectMetadata;
}

export const ObjectFieldForm = ({
  requiredFields,
  properties,
  onSave,
  onCancel,
  initialData = {},
  hideField = false,
  objectMetadata,
}: ObjectFormProps) => {
  const [formData, setFormData] = useState<any>(initialData);

  return (
    <div className="w-full">
      <div className="p-1">
        <form
          onSubmit={(e) => {
            if (onSave) {
              e.preventDefault();
              e.stopPropagation();
              onSave(formData);
            }
          }}
          className="space-y-6"
        >
          <div className="pb-2">
            <FormFields
              properties={properties}
              formData={formData}
              setFormData={setFormData}
              objectMetadata={objectMetadata}
              hideField={hideField}
              requiredFields={requiredFields}
            />
          </div>
          <div className="mt-6 flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="default">
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
