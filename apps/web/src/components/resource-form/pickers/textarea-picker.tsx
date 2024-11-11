import { Textarea } from "@/components/ui/textarea";
import { Field } from "../form-field";

export const TextAreaPicker = ({
  fieldName,
  required,
  description,
  onChange,
  hideField,
  value,
}: {
  fieldName: string;
  required: boolean;
  description?: string;
  onChange: (value: string) => void;
  hideField?: boolean;
  value: string;
}) => {
  return (
    <Field
      fieldName={fieldName}
      required={required}
      description={description}
      hideField={hideField}
      showLabel={true}
    >
      <Textarea value={value} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
};
