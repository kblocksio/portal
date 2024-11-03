import { uiPickerParser } from "../resource-form/pickers/ui-picker-parser";
import { resolvePickerField } from "../resource-form/pickers/picker-resolver";

export const resolveOutputField = ({
  schema,
  value,
  key,
}: {
  schema: any;
  value: any;
  key: string;
}) => {
  const { description } = schema;
  const uiPicker = uiPickerParser(description ?? "");

  if (uiPicker) {
    const pickerField = resolvePickerField({
      pickerType: uiPicker.type,
      pickerConfig: uiPicker.config,
      fieldName: key,
      required: false,
      schema: schema,
      description: description,
      handleChange: () => {},
      objectMetadata: {
        name: "",
        namespace: "",
        system: "",
      },
      value,
      path: "",
      formData: {},
      updateFormData: () => {},
    });

    if (pickerField) {
      return pickerField;
    }
  }
};
