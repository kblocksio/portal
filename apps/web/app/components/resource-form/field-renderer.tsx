import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "~/components/ui/dialog";
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
  const keys = path.split('.');
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
  return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), data);
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
        <form onSubmit={(e) => {
          if (onSave) {
            e.preventDefault();
            e.stopPropagation();
            onSave(formData);
          }
        }} className="space-y-6 ml-2 mr-2">
          <div className="pb-2">
            {FormFields({
              properties,
              formData,
              setFormData,
              objectMetadata,
              hideField,
              requiredFields
            })}
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
            >
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

  const [itemData, setItemData] = useState<any>(initialData ?? (type === 'object' ? {} : ''));

  const updateItemData = (newData: any) => {
    setItemData(newData);
  };

  const handleSave = () => {
    onSave(itemData);
  };

  return (
    <div className="w-full">
      <div className="p-1">
        <div className="space-y-6 ml-2 mr-2">
          {type === 'object' || type === 'array' ? (
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
        <div className="flex justify-end space-x-2 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
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
      case 'boolean':
        return <SwitchField value={value} onChange={handleChange} required={required} />;
      case 'string': {
        if (schema?.enum) {
          return <EnumField values={schema.enum} selectedValue={value || schema.default} onChange={handleChange} required={required} />;
        }

        return <InputField value={value} onChange={handleChange} placeholder={defaultValue} required={required} type={type} />;
      }

      default: return <InputField value={value} onChange={handleChange} required={required} type={type} placeholder={defaultValue} />
    }
  };

  return (
    <Field hideField={hideField} fieldName={fieldName} required={required} description={description} showLabel={showLabel}>
      {getPrimitiveWidget()}
    </Field>
  );
}

export const Field = ({ hideField = false, fieldName, required, description, children, showLabel = true }: {
  hideField?: boolean, 
  fieldName: string, 
  required?: boolean, 
  description?: string,
  children: React.ReactNode,
  showLabel?: boolean,
}) => {
  const sanitizedDescription = sanitizeDescription(description);
  return <div className="space-y-4 mb-6">
    {!hideField && (
      <div className="flex flex-col">
        {showLabel && (
          <Label htmlFor={fieldName} className="text-sm font-medium">
            {splitAndCapitalizeCamelCase(fieldName)}
            {required && <span className="text-destructive">*</span>}
          </Label>
        )}
        {sanitizedDescription && (
          <p className="text-[0.8rem] text-muted-foreground pt-1">
            {parseDescription(sanitizedDescription)}
          </p>
        )}
      </div>
    )}
    {children}
  </div>
};

const resolvePickerField = ({ pickerType, pickerConfig, fieldName, required,  schema, handleChange, objectMetadata , value, hideField, description, formData, updateFormData, path }: { 
  pickerType: string, 
  pickerConfig: any, 
  fieldName: string, 
  required: boolean, 
  schema: any, 
  handleChange: (value: string | number | boolean) => void, 
  objectMetadata: ObjectMetadata,
  formData: any,
  updateFormData: (data: any) => void,
  path: string,
  value: any,
  hideField?: boolean,
  description?: string,
}) => {
  switch (pickerType) {
    case 'instance-picker': {
      return <InstancePicker
        fieldName={fieldName}
        initialValue={value}
        required={required}
        description={description}
        hideField={hideField}
        defaultInstanceName={schema.default}
        config={pickerConfig}
        onInstanceChange={handleChange}
      />;
    }
    case 'repo-picker': {
      return <RepoPicker
        initialValue={value}
        handleOnSelection={(repo) => {
          if (repo?.full_name) {
            handleChange(repo?.full_name)
          }
        }}
      />;
    }
    case 'one-of': {
      return <OneOfPicker
        schema={schema} 
        fieldName={fieldName} 
        hideField={hideField} 
        required={required} 
        description={description} 
        formData={formData}
        setFormData={updateFormData} 
        objectMetadata={objectMetadata} 
        path={path} 
        />;
    }
    case 'cron-picker': // <-- meanwhile, just render as a normal field
    default: {
      return undefined;
    }
  }
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
  const { type, properties, additionalProperties, description } = schema;
  const uiPicker = uiPickerParser(description ?? '');

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
    return <ObjectFieldRenderer
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
  }

  if (type === "object" && additionalProperties) {
    // TODO: fix this because this shuold be a map 
    return <MapFieldRenderer
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

  }

  if (type === "array") {
    return <ArrayFieldRenderer
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
      />;
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

export function FormFields({ properties, formData, setFormData, objectMetadata, hideField, requiredFields, path }: { 
  properties: any, 
  formData: any, 
  setFormData: (data: any) => void, 
  objectMetadata: ObjectMetadata, 
  hideField: boolean, 
  path?: string,
  requiredFields: string[] | undefined
}) {
  return <div>
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
          required={requiredFields?.includes(key)} />
      ))
      : null}
  </div>;
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
  const items = getDataByPath(formData, path) || new Map();

  const handleAddItem = () => {
    setEditKey(null);
    setShowMapModal(true);
  };

  const handleEditItem = (key: string) => {
    setEditKey(key);
    setShowMapModal(true);
  };

  const handleRemoveItem = (key: string) => {
    const currentData = new Map(items);
    currentData.delete(key);
    const newFormData = updateDataByPath(formData, path, currentData);
    updateFormData(newFormData);
  };

  const handleSaveItem = (itemData: any) => {
    const currentData = new Map(items);
    if (editKey !== null) {
      currentData.set(editKey, itemData);
    } else {
      currentData.set(itemData.key, itemData.value);
    }
    const newFormData = updateDataByPath(formData, path, currentData);
    updateFormData(newFormData);
    setShowMapModal(false);
  };

  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="text-sm font-medium">
          {splitAndCapitalizeCamelCase(fieldName ?? '')}
          {required && <span className="text-destructive">*</span>}
          {description && (
            <p className="text-[0.8rem] text-muted-foreground pt-1">
              {parseDescription(description)}
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleAddItem}
          className="h-8 px-3 text-xs mr-2 ml-2"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add
        </Button>
      </div>
      <div>
        {items.length > 0 && (
          <div className="space-y-2">
            {items.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-2 bg-secondary rounded-md">
                <div className="flex-1 truncate text-sm">
                  {typeof item === 'object' ? `Item ${index + 1}` : item}
                </div>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleEditItem(item.key)}
                    className="h-8 w-8 p-0"
                  >
                    <Pencil className="w-3 h-3" />
                    <span className="sr-only">Edit item</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleRemoveItem(item.key)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-3 h-3" />
                    <span className="sr-only">Remove item</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Dialog open={showMapModal} onOpenChange={(open: boolean) => setShowMapModal(open)}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader className="border-b border-gray-200 pb-4 mb-1">
            <DialogTitle className="text-lg">
              {splitAndCapitalizeCamelCase(fieldName ?? '')} item
            </DialogTitle>
            {description && (
              <DialogDescription className="text-sm text-muted-foreground">
                {parseDescription(description)}
              </DialogDescription>
            )}
          </DialogHeader>
          <ArrayItemForm
            objectMetadata={objectMetadata}
            fieldName={fieldName ?? ''}
            schema={schema.items}
            initialData={editKey !== null ? items[editKey] : undefined}
            onSave={handleSaveItem}
            onCancel={() => setShowMapModal(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
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
    <div className="space-y-4 mb-6">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="text-sm font-medium">
          {splitAndCapitalizeCamelCase(fieldName ?? '')}
          {required && <span className="text-destructive">*</span>}
          {description && (
            <p className="text-[0.8rem] text-muted-foreground pt-1">
              {parseDescription(description)}
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleAddItem}
          className="h-8 px-3 text-xs mr-2 ml-2"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add
        </Button>
      </div>
      <div>
        {items.length > 0 && (
          <div className="space-y-2">
            {items.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-2 bg-secondary rounded-md">
                <div className="flex-1 truncate text-sm">
                  {typeof item === 'object' ? `Item ${index + 1}` : item}
                </div>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleEditItem(index)}
                    className="h-8 w-8 p-0"
                  >
                    <Pencil className="w-3 h-3" />
                    <span className="sr-only">Edit item</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleRemoveItem(index)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-3 h-3" />
                    <span className="sr-only">Remove item</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Dialog open={showArrayModal} onOpenChange={(open: boolean) => setShowArrayModal(open)}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader className="border-b border-gray-200 pb-4 mb-1">
            <DialogTitle className="text-lg">
              {splitAndCapitalizeCamelCase(fieldName ?? '')} item
            </DialogTitle>
            {description && (
              <DialogDescription className="text-sm text-muted-foreground">
                {parseDescription(description)}
              </DialogDescription>
            )}
          </DialogHeader>
          <ArrayItemForm
            objectMetadata={objectMetadata}
            fieldName={fieldName ?? ''}
            schema={schema.items}
            initialData={editIndex !== null ? items[editIndex] : undefined}
            onSave={handleSaveItem}
            onCancel={() => setShowArrayModal(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
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
          <p className="text-[0.8rem] text-muted-foreground pb-6">
            {parseDescription(description)}
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
    <div className="space-y-4 mb-6">
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
                  <Check className="w-3 h-3 mr-1" />
                  Set
                </Badge>
              )}
            </div>
            {description && (
              <p className="text-[0.8rem] text-muted-foreground pt-1">
                {parseDescription(description)}
              </p>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleEditObject}
            className="h-8 px-3 text-xs mr-2 ml-2"
          >
            <Pencil className="w-3 h-3 mr-1" />
            Edit
          </Button>
        </div>
      ) : (
        <div className="space-y-6 ml-2 mr-2">
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
            : null
          }
        </div>
      )}
      <Dialog open={showObjectModal} onOpenChange={(open: boolean) => setShowObjectModal(open)}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader className="border-b border-gray-200 pb-4 mb-1">
            <DialogTitle className="text-lg">
              {splitAndCapitalizeCamelCase(fieldName ?? '')}
            </DialogTitle>
            {description && (
              <DialogDescription className="text-sm text-muted-foreground">
                {parseDescription(description)}
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