import React, { useState } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
// Utility functions to update and get data by path
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

// Modal component
interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ onClose, children }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="bg-white p-4 rounded shadow-lg z-50">{children}</div>
    </div>
  );
};

// FieldRenderer component
interface FieldRendererProps {
  schema: any;
  path: string;
  formData: any;
  updateFormData: (data: any) => void;
  fieldName?: string;
  hideLabel?: boolean;
}

const FieldRenderer: React.FC<FieldRendererProps> = ({
  schema,
  path,
  formData,
  updateFormData,
  fieldName,
  hideLabel = false,
}) => {
  const { type, properties, additionalProperties } = schema;

  if (type === 'object' && (properties || additionalProperties)) {
    if (additionalProperties) {
      // Handle additionalProperties like an array
      const [showModal, setShowModal] = useState(false);
      const [editIndex, setEditIndex] = useState<number | null>(null);
      const items = getDataByPath(formData, path) || [];

      const handleAddItem = () => {
        setEditIndex(null);
        setShowModal(true);
      };

      const handleEditItem = (index: number) => {
        setEditIndex(index);
        setShowModal(true);
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
        setShowModal(false);
      };

      return (
        <div className="mb-4">
          {!hideLabel && fieldName && (
            <div className="flex items-center mb-2">
              <Label className="text-base mb-2">{fieldName}</Label>
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddItem}
                className="px-2 py-1 ml-auto"
              >
                Add
              </Button>
            </div>
          )}
          {items.length > 0 && (
            <div className="space-y-2 ml-4">
              {items.map((item: any, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="flex-1">{`Item ${index + 1}`}</div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => handleEditItem(index)}
                    className="px-2 py-1"
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => handleRemoveItem(index)}
                    className="px-2 py-1"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
          {showModal && (
            <Modal onClose={() => setShowModal(false)}>
              <ObjectForm
                schema={additionalProperties}
                initialData={editIndex !== null ? items[editIndex] : {}}
                onSave={handleSaveItem}
                onCancel={() => setShowModal(false)}
                hideLabel={true}
              />
            </Modal>
          )}
        </div>
      );
    } else {
      // Handle normal properties
      return (
        <div className="mb-4">
          {!hideLabel && fieldName && (
            <Label className="text-base mb-2">{fieldName}</Label>
          )}
          <div className="space-y-4 ml-4">
            {properties
              ? Object.keys(properties).map((key) => (
                <FieldRenderer
                  key={key}
                  schema={properties[key]}
                  path={path ? `${path}.${key}` : key}
                  formData={formData}
                  updateFormData={updateFormData}
                  fieldName={key}
                />
              ))
              : null}
          </div>
        </div>
      );
    }
  } else if (type === 'array') {
    const [showModal, setShowModal] = useState(false);
    const [editIndex, setEditIndex] = useState<number | null>(null);

    const items = getDataByPath(formData, path) || [];

    const handleAddItem = () => {
      setEditIndex(null);
      setShowModal(true);
    };

    const handleEditItem = (index: number) => {
      setEditIndex(index);
      setShowModal(true);
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
      setShowModal(false);
    };

    return (
      <div className="mb-4">
        {!hideLabel && fieldName && (
          <div className="flex items-center mb-2">
            <Label className="text-base mb-2">{fieldName}</Label>
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddItem}
              className="px-2 py-1 ml-auto"
            >
              Add
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
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => handleRemoveItem(index)}
                  className="px-2 py-1"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
        {showModal && (
          <Modal onClose={() => setShowModal(false)}>
            <ArrayItemForm
              schema={schema.items}
              initialData={editIndex !== null ? items[editIndex] : undefined}
              onSave={handleSaveItem}
              onCancel={() => setShowModal(false)}
            />
          </Modal>
        )}
      </div>
    );
  } else {
    // Primitive type
    const value = getDataByPath(formData, path) ?? '';

    const handleChange = (value: string) => {
      const newFormData = updateDataByPath(formData, path, value);
      updateFormData(newFormData);
    };

    return (
      <div className="mb-4">
        {!hideLabel && fieldName && (
          <Label className="text-base mb-2">{fieldName}</Label>
        )}
        {type === 'boolean' ? (
          <Select value={value} onValueChange={handleChange}>
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
            type={type === 'number' ? 'number' : 'text'}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            className="border p-1 rounded w-full"
          />
        )}
      </div>
    );
  }
};

// ArrayItemForm component
interface ArrayItemFormProps {
  schema: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

const ArrayItemForm: React.FC<ArrayItemFormProps> = ({
  schema,
  onSave,
  onCancel,
  initialData,
}) => {
  const { type } = schema;

  const [itemData, setItemData] = useState<any>(initialData ?? (type === 'object' ? {} : ''));

  const updateItemData = (newData: any) => {
    setItemData(newData);
  };

  const handleSave = () => {
    onSave(itemData);
  };

  return (
    <div className="w-full max-h-full overflow-y-auto p-4">
      {type === 'object' || type === 'array' ? (
        <FieldRenderer
          schema={schema}
          path=""
          formData={itemData}
          updateFormData={updateItemData}
          hideLabel={true}
        />
      ) : (
        <div className="mb-4">
          <Label className="text-base mb-2">Value</Label>
          {type === 'boolean' ? (
            <Select
              value={itemData}
              onValueChange={(value) => setItemData(value === 'true')}
            >          <SelectTrigger id="boolean-select">
                <SelectValue placeholder="Select a value" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">True</SelectItem>
                <SelectItem value="false">False</SelectItem>
              </SelectContent>
            </Select>

          ) : (
            <Input
              type={type === 'number' ? 'number' : 'text'}
              value={itemData}
              onChange={(e) =>
                setItemData(type === 'number' ? Number(e.target.value) : e.target.value)
              }
              className="border p-1 rounded w-full"
            />
          )}
        </div>
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

// ObjectForm component
interface ObjectFormProps {
  schema: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
  hideLabel?: boolean;
}

const ObjectForm: React.FC<ObjectFormProps> = ({
  schema,
  onSave,
  onCancel,
  initialData = {},
  hideLabel = false,
}) => {
  const [objectData, setObjectData] = useState<any>(initialData);

  const updateObjectData = (newData: any) => {
    setObjectData(newData);
  };

  return (
    <div className="w-full max-h-full overflow-y-auto p-4">
      <FieldRenderer
        schema={schema}
        path=""
        formData={objectData}
        updateFormData={updateObjectData}
        hideLabel={hideLabel}
      />
      <div className="flex space-x-2 mt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => onSave(objectData)}
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

// Main FormGenerator component
interface FormGeneratorProps {
  schema: any;
}

const FormGenerator: React.FC<FormGeneratorProps> = ({ schema }) => {
  const [formData, setFormData] = useState<any>({});

  const updateFormData = (newData: any) => {
    setFormData(newData);
  };

  return (
    <form className="space-y-4 overflow-y-auto max-h-[80vh]">
      <FieldRenderer
        schema={schema}
        path=""
        formData={formData}
        updateFormData={updateFormData}
        hideLabel={true}
      />
      <pre className="mt-4 bg-gray-100 p-2 rounded">
        {JSON.stringify(formData, null, 2)}
      </pre>
    </form>
  );
};

export default FormGenerator;
