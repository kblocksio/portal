import { useState } from "react";
import { uiPickerParser } from "./pickers/ui-picker-parser";
import { ObjectMetadata } from "@repo/shared";
import { getDataByPath, reorderProperties, updateDataByPath } from "./utils";
import { ObjectFieldRenderer } from "./object-field-renderer";
import { resolvePickerField } from "./pickers/picker-resolver";
import { ArrayFieldRenderer } from "./array-field-renderer";
import { PrimitiveFieldRenderer } from "./primitive-field-renderer";
import { MapFieldRenderer } from "./map-field-renderer";

interface FieldRendererProps {
  schema: any;
  path: string;
  formData: any;
  objectMetadata: ObjectMetadata;
  updateFormData: (data: any) => void;
  fieldName: string;
  hideField?: boolean;
  required?: boolean;
  /**
   * Indicates that the field is part of a "one-off" picker, so objects should be rendered inline.
   * and not in a modal dialog that opens when an "Edit" button is clicked.
   *
   * Additionally, the field will not have a label since the label is already displayed in the
   * picker.
   */
  inline?: boolean;
}

export const FieldRenderer = ({
  schema,
  path,
  formData,
  objectMetadata,
  updateFormData,
  fieldName,
  hideField = false,
  required = false,
  inline = false,
}: FieldRendererProps) => {
  const reorderedSchema = reorderProperties(schema);
  const { type, properties, additionalProperties, description } =
    reorderedSchema;
  const uiPicker = uiPickerParser(description ?? "");

  const [showObjectModal, setShowObjectModal] = useState(false);
  const [showArrayModal, setShowArrayModal] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [editKey, setEditKey] = useState<string | null>(null);

  const value = getDataByPath(formData, path);

  const handleChange = (value: string | number | boolean) => {
    const newFormData = updateDataByPath(formData, path, value);
    updateFormData(newFormData);
  };

  if (uiPicker) {
    const pickerField = resolvePickerField({
      pickerType: uiPicker.type,
      pickerConfig: uiPicker.config,
      fieldName: fieldName,
      required: required,
      schema: schema,
      hideField: hideField,
      description: description,
      handleChange,
      objectMetadata: objectMetadata,
      value,
      path,
      formData,
      updateFormData,
    });

    if (pickerField) {
      return pickerField;
    }
  }

  if (type === "object" && properties) {
    return (
      <ObjectFieldRenderer
        objectMetadata={objectMetadata}
        schema={schema}
        formData={formData}
        path={path}
        updateFormData={updateFormData}
        fieldName={fieldName}
        required={required}
        hideField={hideField}
        setShowObjectModal={setShowObjectModal}
        showObjectModal={showObjectModal}
        inline={inline}
        properties={properties}
        description={description}
      />
    );
  }

  if (type === "object" && additionalProperties) {
    return (
      <MapFieldRenderer
        objectMetadata={objectMetadata}
        schema={schema}
        formData={formData}
        path={path}
        updateFormData={updateFormData}
        fieldName={fieldName}
        required={required}
        setShowMapModal={setShowObjectModal}
        showMapModal={showObjectModal}
        description={description}
        setEditKey={setEditKey}
        editKey={editKey}
      />
    );
  }

  if (type === "array") {
    return (
      <ArrayFieldRenderer
        formData={formData}
        path={path}
        updateFormData={updateFormData}
        fieldName={fieldName}
        required={required}
        schema={schema}
        setEditIndex={setEditIndex}
        setShowArrayModal={setShowArrayModal}
        showArrayModal={showArrayModal}
        editIndex={editIndex}
        objectMetadata={objectMetadata}
        description={description}
      />
    );
  }

  return (
    <PrimitiveFieldRenderer
      objectMetadata={objectMetadata}
      required={required}
      type={type}
      handleChange={handleChange}
      value={value}
      fieldName={fieldName}
      description={description}
      hideField={hideField}
      schema={schema}
      showLabel={!inline}
    />
  );
};
