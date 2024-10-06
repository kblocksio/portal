import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Pencil, Plus, X } from "lucide-react";


interface ObjectFormProps {
  properties: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
  hideField?: boolean;
  requiredFields?: string[];
}

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
    <div className="w-full max-h-full overflow-y-auto p-1">
      <form onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onSave(objectData);
      }}>
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
        <div className="flex space-x-2 mt-4">
          <Button
            type="submit"
            variant="secondary"
            className="px-2 py-1"
          >
            Save
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            className="px-2 py-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};


interface ArrayItemFormProps {
  fieldName: string;
  schema: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

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
    <div className="w-full max-h-full overflow-y-auto p-1">
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
      <div className="flex space-x-2 mt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={handleSave}
          className="px-2 py-1"
        >
          Save
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="px-2 py-1"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

interface PrimitiveFieldRendererProps {
  type: string;
  handleChange: (value: string) => void;
  value: any;
  fieldName?: string;
  hideField?: boolean;
  required?: boolean;
}

const PrimitiveFieldRenderer = ({
  type,
  handleChange,
  value,
  fieldName,
  hideField = false,
  required = false,
}: PrimitiveFieldRendererProps) => {
  return (
    <div className="m-1">
      {!hideField && fieldName && (
        <Label className="mb-2">{fieldName}</Label>
      )}
      {type === 'boolean' ? (
        <Select value={value} onValueChange={handleChange} required={required}>
          <SelectTrigger>
            <SelectValue placeholder="Select a value" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">True</SelectItem>
            <SelectItem value="false">False</SelectItem>
          </SelectContent>
        </Select>
      ) : (
        <Input
          required={required}
          type={type === 'number' ? 'number' : 'text'}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          className="border p-1 rounded w-full"
        />
      )}
    </div>
  );
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

interface FieldRendererProps {
  schema: any;
  path: string;
  formData: any;
  updateFormData: (data: any) => void;
  fieldName?: string;
  hideField?: boolean;
  required?: boolean;
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
      <div className="m-1">
        {!hideField && fieldName ? (
          <div className="flex items-center mb-2">
            <Label className="mb-2">{fieldName}</Label>
            <Button
              type="button"
              variant="secondary"
              onClick={handleEditObject}
              className="px-2 py-1 ml-auto"
            >
              <Pencil className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-4 ml-4">
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
        {
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
        }
      </div >
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
      <div className="m-1">
        {!hideField && fieldName && (
          <div className="flex items-center mb-2">
            <Label className="mb-2">{fieldName}</Label>
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddItem}
              className="px-2 py-1 ml-auto"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        )}
        {items.length > 0 && (
          <div className="space-y-2 ml-4">
            {items.map((item: any, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="flex-1">
                  {typeof item === 'object' ? `Item ${index + 1}` : item}
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => handleEditItem(index)}
                  className="px-2 py-1"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => handleRemoveItem(index)}
                  className="px-2 py-1"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
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
      </div>
    )
  } else {
    // Primitive type
    const value = getDataByPath(formData, path) ?? '';

    const handleChange = (value: string) => {
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
