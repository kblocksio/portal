import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Pencil, Plus, X, Check } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { SwitchField } from "./switch-field";
import { InputField } from "./input-field";
import { parseDescription, sanitizeDescription } from "./description-parser";
import { EnumField } from "./enum-field";
import { splitAndCapitalizeCamelCase } from "./label-formater";
import { uiPickerParser } from "./pickers/ui-picker-parser";
import { InstancePicker } from "./pickers/instance-picker";
import { ObjectMetadata } from "@repo/shared";
import { OneOfPicker } from "./pickers/oneof-picker";
import { RepoPicker } from "./pickers/repo-picker";
import { reorderProperties } from "./utils";

interface ObjectFormProps {
  properties: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
  hideField?: boolean;
  requiredFields?: string[];
  objectMetadata: ObjectMetadata;
}

interface ArrayItemFormProps {
  fieldName: string;
  schema: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
  objectMetadata: ObjectMetadata;
}

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

export const updateDataByPath = (data: any, path: string, value: any): any => {
  const keys = path.split(".");
  const newData = { ...data };

  let obj = newData;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!obj[keys[i]]) {
      obj[keys[i]] = {};
    } else if (Array.isArray(obj[keys[i]])) {
      obj[keys[i]] = [...obj[keys[i]]];
    } else {
      obj[keys[i]] = { ...obj[keys[i]] };
    }
    obj = obj[keys[i]];
  }
  obj[keys[keys.length - 1]] = value;
  return newData;
};

export const getDataByPath = (data: any, path: string) => {
  if (!path) return data;
  return path
    .split(".")
    .reduce((acc, key) => (acc ? acc[key] : undefined), data);
};

const isObjectPopulated = (obj: any) => {
  return obj && Object.keys(obj).length > 0;
};

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
          className="ml-2 mr-2 space-y-6"
        >
          <div className="pb-2">
            {FormFields({
              properties,
              formData,
              setFormData,
              objectMetadata,
              hideField,
              requiredFields,
            })}
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

export const ArrayItemForm = ({
  fieldName,
  schema,
  onSave,
  onCancel,
  initialData,
  objectMetadata,
}: ArrayItemFormProps) => {
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
        <div className="ml-2 mr-2 space-y-6">
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

interface MapItemFormProps {
  fieldName: string;
  schema: any;
  onSave: (key: string, value: any) => void;
  onCancel: () => void;
  initialKey?: string;
  initialData?: any;
  objectMetadata: ObjectMetadata;
}

export const MapItemForm = ({
  fieldName,
  schema,
  onSave,
  onCancel,
  initialKey,
  initialData,
  objectMetadata,
}: MapItemFormProps) => {
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
      <div className="ml-2 mr-2 space-y-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-2 border-b pb-2">
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
            {type === "object" || type === "array" ? (
              <FieldRenderer
                objectMetadata={objectMetadata}
                schema={schema}
                path=""
                formData={valueData}
                updateFormData={updateValueData}
                fieldName={fieldName}
                hideField={true}
                required={schema.required?.includes(fieldName)}
              />
            ) : (
              <PrimitiveFieldRenderer
                type={type}
                handleChange={setValueData}
                value={valueData}
                fieldName={fieldName}
                description={schema?.description}
                required={schema.required?.includes(fieldName)}
                schema={schema}
                objectMetadata={objectMetadata}
              />
            )}
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

const PrimitiveFieldRenderer = ({
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

export const Field = ({
  hideField = false,
  fieldName,
  required,
  description,
  children,
  showLabel = true,
}: {
  hideField?: boolean;
  fieldName: string;
  required?: boolean;
  description?: string;
  children: React.ReactNode;
  showLabel?: boolean;
}) => {
  const sanitizedDescription = sanitizeDescription(description);
  return (
    <div className="mb-6 space-y-4">
      {!hideField && (
        <div className="flex flex-col">
          {showLabel && (
            <Label htmlFor={fieldName} className="text-sm font-medium">
              {splitAndCapitalizeCamelCase(fieldName)}
              {required && <span className="text-destructive">*</span>}
            </Label>
          )}
          {sanitizedDescription && (
            <p className="text-muted-foreground pt-1 text-[0.8rem]">
              {parseDescription(sanitizedDescription)}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

const resolvePickerField = ({
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
    case "cron-picker": // <-- meanwhile, just render as a normal field
    default: {
      return undefined;
    }
  }
};

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
  const { type, properties, additionalProperties, description } = reorderedSchema;
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
    // TODO: fix this because this shuold be a map
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

export function FormFields({
  properties,
  formData,
  setFormData,
  objectMetadata,
  hideField,
  requiredFields,
  path,
}: {
  properties: any;
  formData: any;
  setFormData: (data: any) => void;
  objectMetadata: ObjectMetadata;
  hideField: boolean;
  path?: string;
  requiredFields: string[] | undefined;
}) {
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
            />
          ))
        : null}
    </div>
  );
}

function MapFieldRenderer({
  formData,
  path,
  updateFormData,
  fieldName,
  required,
  schema,
  setEditKey,
  setShowMapModal,
  showMapModal,
  editKey,
  objectMetadata,
  description,
}: {
  formData: any;
  path: string;
  updateFormData: (data: any) => void;
  fieldName?: string;
  required: boolean;
  schema: any;
  setEditKey: (key: string | null) => void;
  setShowMapModal: (show: boolean) => void;
  showMapModal: boolean;
  editKey: string | null;
  description: string;
  objectMetadata: ObjectMetadata;
}) {
  const items = getDataByPath(formData, path) || {};

  const handleAddItem = () => {
    setEditKey(null);
    setShowMapModal(true);
  };

  const handleEditItem = (key: string) => {
    setEditKey(key);
    setShowMapModal(true);
  };

  const handleRemoveItem = (key: string) => {
    const currentData = { ...items };
    delete currentData[key];
    const newFormData = updateDataByPath(formData, path, currentData);
    updateFormData(newFormData);
  };

  const handleSaveItem = (key: string, value: any) => {
    const currentData = { ...items };
    if (editKey !== null && editKey !== key) {
      // Key has changed, remove the old key
      delete currentData[editKey];
    }
    currentData[key] = value;
    const newFormData = updateDataByPath(formData, path, currentData);
    updateFormData(newFormData);
    setShowMapModal(false);
  };

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="text-sm font-medium">
          {splitAndCapitalizeCamelCase(fieldName ?? "")}
          {required && <span className="text-destructive">*</span>}
          {description && (
            <p className="text-muted-foreground pt-1 text-[0.8rem]">
              {parseDescription(description)}
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleAddItem}
          className="ml-2 mr-2 h-8 px-3 text-xs"
        >
          <Plus className="mr-1 h-3 w-3" />
          Add
        </Button>
      </div>
      <div>
        {Object.keys(items).length > 0 && (
          <div className="space-y-2">
            {Object.entries(items).map(([key, value]) => (
              <div
                key={key}
                className="bg-secondary flex items-center justify-between rounded-md p-2"
              >
                <div className="flex-1 truncate text-sm">
                  <span className="font-medium">{key}</span>:{" "}
                  <span className="text-muted-foreground ml-2">
                    {typeof value === "object" ? "{...}" : String(value)}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleEditItem(key)}
                    className="h-8 w-8 p-0"
                  >
                    <Pencil className="h-3 w-3" />
                    <span className="sr-only">Edit item</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleRemoveItem(key)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove item</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Dialog
        open={showMapModal}
        onOpenChange={(open: boolean) => setShowMapModal(open)}
      >
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader className="mb-1 border-b border-gray-200 pb-4">
            <DialogTitle className="text-lg">
              {splitAndCapitalizeCamelCase(fieldName ?? "")} item
            </DialogTitle>
            {description && (
              <DialogDescription className="text-muted-foreground text-sm">
                {parseDescription(description)}
              </DialogDescription>
            )}
          </DialogHeader>
          <MapItemForm
            objectMetadata={objectMetadata}
            fieldName={fieldName ?? ""}
            schema={schema.additionalProperties}
            initialKey={editKey !== null ? editKey : ""}
            initialData={editKey !== null ? items[editKey] : undefined}
            onSave={handleSaveItem}
            onCancel={() => setShowMapModal(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ArrayFieldRenderer({
  formData,
  path,
  updateFormData,
  fieldName,
  required,
  schema,
  setEditIndex,
  setShowArrayModal,
  showArrayModal,
  editIndex,
  objectMetadata,
  description,
}: {
  formData: any;
  path: string;
  updateFormData: (data: any) => void;
  fieldName?: string;
  required: boolean;
  schema: any;
  setEditIndex: (index: number | null) => void;
  setShowArrayModal: (show: boolean) => void;
  showArrayModal: boolean;
  editIndex: number | null;
  description: string;
  objectMetadata: ObjectMetadata;
}) {
  const items = getDataByPath(formData, path) || [];

  const handleAddItem = () => {
    setEditIndex(null);
    setShowArrayModal(true);
  };

  const handleEditItem = (index: number) => {
    setEditIndex(index);
    setShowArrayModal(true);
  };

  const handleRemoveItem = (index: number) => {
    const currentData = [...items];
    currentData.splice(index, 1);
    const newFormData = updateDataByPath(formData, path, currentData);
    updateFormData(newFormData);
  };

  const handleSaveItem = (itemData: any) => {
    const currentData = [...items];
    if (editIndex !== null) {
      currentData[editIndex] = itemData;
    } else {
      currentData.push(itemData);
    }
    const newFormData = updateDataByPath(formData, path, currentData);
    updateFormData(newFormData);
    setShowArrayModal(false);
  };

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="text-sm font-medium">
          {splitAndCapitalizeCamelCase(fieldName ?? "")}
          {required && <span className="text-destructive">*</span>}
          {description && (
            <p className="text-muted-foreground pt-1 text-[0.8rem]">
              {parseDescription(sanitizeDescription(description))}
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleAddItem}
          className="ml-2 mr-2 h-8 px-3 text-xs"
        >
          <Plus className="mr-1 h-3 w-3" />
          Add
        </Button>
      </div>
      <div>
        {items.length > 0 && (
          <div className="space-y-2">
            {items.map((item: any, index: number) => (
              <div
                key={index}
                className="bg-secondary flex items-center justify-between rounded-md p-2"
              >
                <div className="flex-1 truncate text-sm">
                  {typeof item === "object" ? `Item ${index + 1}` : item}
                </div>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleEditItem(index)}
                    className="h-8 w-8 p-0"
                  >
                    <Pencil className="h-3 w-3" />
                    <span className="sr-only">Edit item</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleRemoveItem(index)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove item</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Dialog
        open={showArrayModal}
        onOpenChange={(open: boolean) => setShowArrayModal(open)}
      >
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader className="mb-1 border-b border-gray-200 pb-4">
            <DialogTitle className="text-lg">
              {splitAndCapitalizeCamelCase(fieldName ?? "")} item
            </DialogTitle>
            {description && (
              <DialogDescription className="text-muted-foreground text-sm">
                {parseDescription(sanitizeDescription(description))}
              </DialogDescription>
            )}
          </DialogHeader>
          <ArrayItemForm
            objectMetadata={objectMetadata}
            fieldName={fieldName ?? ""}
            schema={schema.items}
            initialData={editIndex !== null ? items[editIndex] : undefined}
            onSave={handleSaveItem}
            onCancel={() => setShowArrayModal(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ObjectFieldRenderer({
  properties,
  description,
  formData,
  path,
  objectMetadata,
  updateFormData,
  schema,
  fieldName,
  inline,
  required,
  hideField,
  setShowObjectModal,
  showObjectModal,
}: {
  properties: any;
  description: string;
  formData: any;
  path: string;
  schema: any;
  objectMetadata: ObjectMetadata;
  updateFormData: (data: any) => void;
  fieldName?: string;
  required: boolean;
  hideField: boolean;
  inline?: boolean;
  setShowObjectModal: (show: boolean) => void;
  showObjectModal: boolean;
}) {
  const handleEditObject = () => {
    setShowObjectModal(true);
  };

  const objectData = getDataByPath(formData, path) ?? {};

  const handleSaveObject = (objectData: any) => {
    const newFormData = updateDataByPath(formData, path, objectData);
    updateFormData(newFormData);
    setShowObjectModal(false);
  };

  const objectProperties = properties;

  // if we are rendering inline, just put the form fields directly and not inside a modal dialog.
  if (inline) {
    return (
      <div className="flex flex-col">
        {description && (
          <p className="text-muted-foreground pb-6 text-[0.8rem]">
            {parseDescription(sanitizeDescription(description))}
          </p>
        )}

        <FormFields
          path={path}
          hideField={hideField}
          objectMetadata={objectMetadata}
          requiredFields={schema.required}
          properties={objectProperties}
          formData={formData}
          setFormData={updateFormData}
        />
      </div>
    );
  }

  return (
    <div className="mb-6 space-y-4">
      {!hideField && fieldName ? (
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <Label className="text-sm font-medium">
                {splitAndCapitalizeCamelCase(fieldName)}
                {required && <span className="text-destructive">*</span>}
              </Label>
              {isObjectPopulated(objectData) && (
                <Badge variant="secondary" className="text-xs">
                  <Check className="mr-1 h-3 w-3" />
                  Set
                </Badge>
              )}
            </div>
            {description && (
              <p className="text-muted-foreground pt-1 text-[0.8rem]">
                {parseDescription(sanitizeDescription(description))}
              </p>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleEditObject}
            className="ml-2 mr-2 h-8 px-3 text-xs"
          >
            <Pencil className="mr-1 h-3 w-3" />
            Edit
          </Button>
        </div>
      ) : (
        <div className="ml-2 mr-2 space-y-6">
          {objectProperties
            ? Object.keys(objectProperties).map((key) => (
                <FieldRenderer
                  key={key}
                  objectMetadata={objectMetadata}
                  schema={objectProperties[key]}
                  path={path ? `${path}.${key}` : key}
                  formData={formData}
                  updateFormData={updateFormData}
                  fieldName={key}
                  required={schema.required?.includes(key)}
                />
              ))
            : null}
        </div>
      )}
      <Dialog
        open={showObjectModal}
        onOpenChange={(open: boolean) => setShowObjectModal(open)}
      >
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader className="mb-1 border-b border-gray-200 pb-4">
            <DialogTitle className="text-lg">
              {splitAndCapitalizeCamelCase(fieldName ?? "")}
            </DialogTitle>
            {description && (
              <DialogDescription className="text-muted-foreground text-sm">
                {parseDescription(sanitizeDescription(description))}
              </DialogDescription>
            )}
          </DialogHeader>
          <ObjectFieldForm
            objectMetadata={objectMetadata}
            requiredFields={schema.required}
            properties={objectProperties}
            initialData={objectData}
            onSave={handleSaveObject}
            onCancel={() => setShowObjectModal(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
