import { useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Pencil, Plus, X, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Switch } from "~/components/ui/switch";

interface ObjectFormProps {
  properties: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
  hideField?: boolean;
  requiredFields?: string[];
}

interface ArrayItemFormProps {
  fieldName: string;
  schema: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

interface PrimitiveFieldRendererProps {
  type: string;
  handleChange: (value: string | number | boolean) => void;
  value: any;
  fieldName?: string;
  hideField?: boolean;
  required?: boolean;
}

interface FieldRendererProps {
  schema: any;
  path: string;
  formData: any;
  updateFormData: (data: any) => void;
  fieldName?: string;
  hideField?: boolean;
  required?: boolean;
}

const isNumeric = (value: string) => /^-?\d+(\.\d+)?$/.test(value);

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
}: ObjectFormProps) => {
  const [objectData, setObjectData] = useState<any>(initialData);

  const updateObjectData = (newData: any) => {
    setObjectData(newData);
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <form onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onSave(objectData);
        }}>
          <div className="space-y-4 ml-2 mr-2">
            {properties
              ? Object.keys(properties).map((key) => (
                <FieldRenderer
                  key={key}
                  schema={properties[key]}
                  path={key}
                  formData={objectData}
                  updateFormData={updateObjectData}
                  fieldName={key}
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
      </CardContent>
    </Card>
  );
};

export const ArrayItemForm = ({
  fieldName,
  schema,
  onSave,
  onCancel,
  initialData,
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
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-4 ml-2 mr-2">
          {type === 'object' || type === 'array' ? (
            <FieldRenderer
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
              required={schema.required?.includes(fieldName)}
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
      </CardContent>
    </Card>
  );
};

const PrimitiveFieldRenderer = ({
  type,
  handleChange,
  value,
  fieldName,
  hideField = false,
  required = false,
}: PrimitiveFieldRendererProps) => {

  const getPrimitiveWidget = useMemo(() => {
    switch (type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={fieldName}
              checked={value}
              onCheckedChange={handleChange}
            />
            <Label htmlFor={fieldName} className="text-sm">
              {value ? 'Enabled' : 'Disabled'}
            </Label>
          </div>
        )
      default:
        return (
          <Input
            id={fieldName}
            required={required}
            type={type === 'number' ? 'number' : 'text'}
            value={value}
            onChange={(e) => {
              const value =
                type === 'number' && isNumeric(e.target.value)
                  ? Number(e.target.value)
                  : e.target.value;

              handleChange(value);
            }}
            className="w-full"
          />
        )
    }
  }, [type, fieldName, value, required, handleChange]);



  return (
    <div className="space-y-4">
      {!hideField && fieldName && (
        <Label htmlFor={fieldName} className="text-sm font-medium">
          {fieldName}
        </Label>
      )}
      {getPrimitiveWidget}
    </div>
  );
}

export const FieldRenderer = ({
  schema,
  path,
  formData,
  updateFormData,
  fieldName,
  hideField = false,
  required = false,
}: FieldRendererProps) => {
  const { type, properties, additionalProperties } = schema;

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

    return (
      <div className="space-y-4">
        {!hideField && fieldName ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Label className="text-sm font-medium">{fieldName}</Label>
              {isObjectPopulated(objectData) && (
                <Badge variant="secondary" className="text-xs">
                  <Check className="w-3 h-3 mr-1" />
                  Set
                </Badge>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleEditObject}
              className="h-8 px-3 text-xs mr-2"
            >
              <Pencil className="w-3 h-3 mr-1" />
              Edit
            </Button>
          </div>
        ) : (
          <div className="space-y-4 ml-2 mr-2">
            {objectProperties
              ? Object.keys(objectProperties).map((key) => (
                <FieldRenderer
                  key={key}
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
                {fieldName}
              </DialogTitle>
            </DialogHeader>
            <ObjectFieldForm
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
      <Card className="mt-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {fieldName}
          </CardTitle>
          <Button
            type="button"
            variant="outline"
            onClick={handleAddItem}
            className="h-8 px-3 text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add
          </Button>
        </CardHeader>
        <CardContent>
          {items.length > 0 ? (
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
          ) : (
            <p className="text-sm text-muted-foreground">No items added yet.</p>
          )}
        </CardContent>
        <Dialog open={showArrayModal} onOpenChange={(open: boolean) => setShowArrayModal(open)}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader className="border-b border-gray-200 pb-4 mb-1">
              <DialogTitle className="text-lg">
                {fieldName} item
              </DialogTitle>
            </DialogHeader>
            <ArrayItemForm
              fieldName={fieldName ?? ''}
              schema={schema.items}
              initialData={editIndex !== null ? items[editIndex] : undefined}
              onSave={handleSaveItem}
              onCancel={() => setShowArrayModal(false)}
            />
          </DialogContent>
        </Dialog>
      </Card>
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
        required={required}
        type={type}
        handleChange={handleChange}
        value={value}
        fieldName={fieldName}
        hideField={hideField}
      />
    );
  }
};