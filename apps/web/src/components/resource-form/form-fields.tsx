import { ObjectMetadata } from "@repo/shared";
import { FieldRenderer } from "./field-renderer";

export const FormFields = ({
  properties,
  formData,
  setFormData,
  objectMetadata,
  hideField,
  requiredFields,
  path,
  readonly = false,
}: {
  properties: any;
  formData: any;
  setFormData: (data: any) => void;
  objectMetadata: ObjectMetadata;
  hideField: boolean;
  path?: string;
  requiredFields: string[] | undefined;
  readonly?: boolean;
}) => {
  return (
    <div>
      {properties
        ? Object.keys(properties).map((key) => (
            <FieldRenderer
              key={key}
              schema={properties[key]}
              path={path ? `${path}.${key}` : key}
              formData={formData}
              updateFormData={setFormData}
              fieldName={key}
              objectMetadata={objectMetadata}
              hideField={hideField}
              required={requiredFields?.includes(key)}
              readonly={readonly}
            />
          ))
        : null}
    </div>
  );
};
