import { useEffect, useMemo, useState } from "react";
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
import { KblocksInstancePickerData, kblocksUiFieldsParser } from "./kblocks-ui-fileds-parser";
import { InstanceTypeField } from "./instance-type-field";
import { ImagePickerField } from "./image-picker-field";
import { ObjectMetadata } from "@repo/shared";
import { GhRepoSelectionField } from "./gh-repo-selection-field";

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
  fieldName?: string;
  description?: string;
  hideField?: boolean;
  required?: boolean;
  schema: any;
  objectMetadata: ObjectMetadata;
}

interface FieldRendererProps {
  schema: any;
  path: string;
  formData: any;
  objectMetadata: ObjectMetadata;
  updateFormData: (data: any) => void;
  fieldName?: string;
  hideField?: boolean;
  required?: boolean;
}

const updateDataByPath = (data: any, path: string, value: any): any => {
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

const getDataByPath = (data: any, path: string) => {
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
  const [objectData, setObjectData] = useState<any>(initialData);

  const updateObjectData = (newData: any) => {
    setObjectData(newData);
  };

  return (
    <div className="w-full">
      <div className="p-1">
        <form onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onSave(objectData);
        }}>
          <div className="space-y-6 ml-2 mr-2">
            {properties
              ? Object.keys(properties).map((key) => (
                <FieldRenderer
                  key={key}
                  schema={properties[key]}
                  path={key}
                  formData={objectData}
                  updateFormData={updateObjectData}
                  fieldName={key}
                  objectMetadata={objectMetadata}
                  hideField={hideField}
                  required={requiredFields?.includes(key)}
                />
              ))
              : null
            }
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
  description,
  hideField = false,
  required = false,
  objectMetadata,
}: PrimitiveFieldRendererProps) => {

  const { fieldType: kblocksFieldType, data: kblocksFieldData } = kblocksUiFieldsParser(description ?? '') ?? {};
  const sanitizedDescription = sanitizeDescription(description ?? '');

  // handle primitive field types
  const getPrimitiveWidget = useMemo(() => {

    // handle kblocks field types
    if (kblocksFieldType) {
      switch (kblocksFieldType) {
        case 'instance-picker': {
          const instancePickerData = kblocksFieldData as KblocksInstancePickerData;
          const defaultInstance = schema.default;
          return <InstanceTypeField
            defaultInstanceName={defaultInstance}
            instanceTypes={instancePickerData}
            onInstanceChange={handleChange}
          />;
        }
        case 'image-picker': {
          return <ImagePickerField
            objectMetadata={objectMetadata}
            fieldName={fieldName ?? ''}
            onImageNameChange={handleChange}
          />;
        }
        case 'repo-picker': {
          return <GhRepoSelectionField
            handleOnSelection={(repo) => handleChange(repo?.full_name ?? '')}
            initialValue={value}
          />;
        }
      }
    }

    switch (type) {
      case 'boolean':
        return (
          <SwitchField
            value={value}
            onChange={handleChange}
            required={required}
          />
        )
      case 'string': {
        if (schema?.enum) {
          return (
            <EnumField
              values={schema.enum}
              selectedValue={value || schema.default}
              onChange={handleChange}
              required={required}
            />
          )
        } else {
          return (
            <InputField
              value={value}
              onChange={handleChange}
              required={required}
              type={type}
            />
          )
        }
      }
      default:
        return (
          <InputField
            value={value}
            onChange={handleChange}
            required={required}
            type={type}
          />
        )
    }
  }, [type, fieldName, value, required, handleChange]);

  return (
    <div className="space-y-4 mb-6">
      {!hideField && fieldName && (
        <div className="flex flex-col">
          <Label htmlFor={fieldName} className="text-sm font-medium">
            {splitAndCapitalizeCamelCase(fieldName)}
            {required && <span className="text-destructive">*</span>}
          </Label>
          {sanitizedDescription && (
            <p className="text-[0.8rem] text-muted-foreground pt-1">
              {parseDescription(sanitizedDescription)}
            </p>
          )}
        </div>
      )}
      {getPrimitiveWidget}
    </div>
  );
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
}: FieldRendererProps) => {

  const { type, properties, additionalProperties, description } = schema;

  if (type === 'object' && (properties || additionalProperties)) {
    const [showObjectModal, setShowObjectModal] = useState(false);

    const handleEditObject = () => {
      setShowObjectModal(true);
    };

    const objectData = getDataByPath(formData, path) || {};

    const handleSaveObject = (objectData: any) => {
      const newFormData = updateDataByPath(formData, path, objectData);
      updateFormData(newFormData);
      setShowObjectModal(false);
    };

    const objectProperties = properties || additionalProperties.properties;
    const objectDescription = sanitizeDescription(description || additionalProperties?.description);
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
              {objectDescription && (
                <p className="text-[0.8rem] text-muted-foreground pt-1">
                  {parseDescription(objectDescription)}
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
              {objectDescription && (
                <DialogDescription className="text-sm text-muted-foreground">
                  {parseDescription(objectDescription)}
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

  } else if (type === 'array') {
    const [showArrayModal, setShowArrayModal] = useState(false);
    const [editIndex, setEditIndex] = useState<number | null>(null);

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
                {parseDescription(sanitizeDescription(description))}
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
  } else {
    // Primitive type
    const value = getDataByPath(formData, path) ?? '';

    const handleChange = (value: string | number | boolean) => {
      const newFormData = updateDataByPath(formData, path, value);
      updateFormData(newFormData);
    };

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
      />
    );
  }
};