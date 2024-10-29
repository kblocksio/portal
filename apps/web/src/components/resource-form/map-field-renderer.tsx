import { ObjectMetadata } from "@repo/shared";
import { linkifyDescription, sanitizeDescription } from "./description-parser";
import { splitAndCapitalizeCamelCase } from "./label-formater";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Pencil, Plus, X } from "lucide-react";
import { getDataByPath, updateDataByPath } from "./utils";
import { MapFieldItemForm } from "./map-field-item-form";

export const MapFieldRenderer = ({
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
  readonly = false,
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
  readonly?: boolean;
}) => {
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
              {linkifyDescription(sanitizeDescription(description))}
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleAddItem}
          className="ml-2 mr-2 h-8 px-3 text-xs"
          disabled={readonly}
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
                    <span className="sr-only">
                      {readonly ? "View item" : "Edit item"}
                    </span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleRemoveItem(key)}
                    className="h-8 w-8 p-0"
                    disabled={readonly}
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
        <DialogContent className="min-h-[400px] sm:max-w-[800px]">
          <DialogHeader className="mb-1 border-b border-gray-200 pb-4">
            <DialogTitle className="text-lg">
              {splitAndCapitalizeCamelCase(fieldName ?? "")} item
            </DialogTitle>
            {description && (
              <DialogDescription className="text-muted-foreground text-sm">
                {linkifyDescription(sanitizeDescription(description))}
              </DialogDescription>
            )}
          </DialogHeader>
          <MapFieldItemForm
            objectMetadata={objectMetadata}
            fieldName={fieldName ?? ""}
            schema={schema.additionalProperties}
            initialKey={editKey !== null ? editKey : ""}
            initialData={editKey !== null ? items[editKey] : undefined}
            onSave={handleSaveItem}
            onCancel={() => setShowMapModal(false)}
            readonly={readonly}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
