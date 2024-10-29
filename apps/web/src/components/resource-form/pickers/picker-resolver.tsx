import { ObjectMetadata } from "@repo/shared";
import { InstancePicker } from "./instance-picker";
import { RepoPicker } from "./repo-picker";
import { OneOfPicker } from "./oneof-picker";

export const resolvePickerField = ({
  pickerType,
  pickerConfig,
  fieldName,
  required,
  schema,
  handleChange,
  objectMetadata,
  value,
  hideField,
  description,
  formData,
  updateFormData,
  path,
  readonly = false,
}: {
  pickerType: string;
  pickerConfig: any;
  fieldName: string;
  required: boolean;
  schema: any;
  handleChange: (value: string | number | boolean) => void;
  objectMetadata: ObjectMetadata;
  formData: any;
  updateFormData: (data: any) => void;
  path: string;
  value: any;
  hideField?: boolean;
  description?: string;
  readonly?: boolean;
}) => {
  switch (pickerType) {
    case "instance-picker": {
      return (
        <InstancePicker
          fieldName={fieldName}
          initialValue={value}
          required={required}
          description={description}
          hideField={hideField}
          defaultInstanceName={schema.default}
          config={pickerConfig}
          onInstanceChange={handleChange}
          readonly={readonly}
        />
      );
    }
    case "repo-picker": {
      return (
        <RepoPicker
          initialValue={value}
          handleOnSelection={(repo) => {
            if (repo?.full_name) {
              handleChange(repo?.full_name);
            }
          }}
          readonly={readonly}
        />
      );
    }
    case "one-of": {
      return (
        <OneOfPicker
          schema={schema}
          fieldName={fieldName}
          hideField={hideField}
          required={required}
          description={description}
          formData={formData}
          setFormData={updateFormData}
          objectMetadata={objectMetadata}
          path={path}
          readonly={readonly}
        />
      );
    }
    case "cron-picker": // <-- meanwhile, just render as a normal field
    default: {
      return undefined;
    }
  }
};
