import { SwitchField } from "./switch-field";
import { InputField } from "./input-field";
import { EnumField } from "./enum-field";
import { ObjectMetadata } from "@repo/shared";
import { Field } from "./form-field";

interface PrimitiveFieldRendererProps {
  type: string;
  handleChange: (value: string | number | boolean) => void;
  value: any;
  fieldName: string;
  defaultValue?: any;
  description?: string;
  hideField?: boolean;
  required?: boolean;
  schema: any;
  objectMetadata: ObjectMetadata;
  showLabel?: boolean;
}

export const PrimitiveFieldRenderer = ({
  schema,
  type,
  handleChange,
  value,
  fieldName,
  defaultValue,
  description,
  hideField = false,
  required = false,
  showLabel = true,
}: PrimitiveFieldRendererProps) => {
  const getPrimitiveWidget = () => {
    switch (type) {
      case "boolean":
        return (
          <SwitchField
            value={value}
            onChange={handleChange}
            required={required}
          />
        );
      case "string": {
        if (schema?.enum) {
          return (
            <EnumField
              values={schema.enum}
              selectedValue={value || schema.default}
              onChange={handleChange}
              required={required}
            />
          );
        }

        return (
          <InputField
            value={value}
            onChange={handleChange}
            placeholder={defaultValue}
            required={required}
            type={type}
          />
        );
      }

      default:
        return (
          <InputField
            value={value}
            onChange={handleChange}
            required={required}
            type={type}
            placeholder={defaultValue}
          />
        );
    }
  };

  return (
    <Field
      hideField={hideField}
      fieldName={fieldName}
      required={required}
      description={description}
      showLabel={showLabel}
    >
      {getPrimitiveWidget()}
    </Field>
  );
};
