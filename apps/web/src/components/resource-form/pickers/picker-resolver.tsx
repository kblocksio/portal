import { ObjectMetadata } from "@repo/shared";
import { InstancePicker } from "./instance-picker";
import { RepoPicker } from "./repo-picker";
import { OneOfPicker } from "./oneof-picker";
import SwaggerUIComponent from "./swagger-ui";
import HiddenComponent from "./hidden-component";
import { Shell } from "./shell";

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
  defaultValue,
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
  defaultValue?: string;
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
          defaultValue={defaultValue}
        />
      );
    }
    case "repo-picker": {
      return (
        <RepoPicker
          fieldName={fieldName}
          required={required}
          description={description}
          hideField={hideField}
          initialValue={value}
          defaultValue={defaultValue}
          handleOnSelection={(repo) => {
            if (repo?.full_name) {
              handleChange(repo?.full_name);
            }
          }}
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
        />
      );
    }
    case "swagger-ui": {
      return <SwaggerUIComponent spec={value} />;
    }
    case "hidden": {
      return <HiddenComponent />;
    }
    case "shell": {
      return <Shell value={value} />;
    }
    case "cron-picker": // <-- meanwhile, just render as a normal field
    default: {
      return undefined;
    }
  }
};
