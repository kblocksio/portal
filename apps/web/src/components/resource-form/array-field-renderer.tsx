import { ObjectMetadata } from "@kblocks-portal/shared";
import { getDataByPath, updateDataByPath } from "./utils";
import { linkifyDescription, sanitizeDescription } from "./description-parser";
import { splitAndCapitalizeCamelCase } from "@/lib/utils";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Plus, Pencil, X } from "lucide-react";
import { ArrayFieldItemForm } from "./array-field-item-form";

export const ArrayFieldRenderer = ({
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
}) => {
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
        <div className="relative">
          <div className="text-sm font-medium">
            {splitAndCapitalizeCamelCase(fieldName ?? "")}
            {required && <span className="text-destructive">*</span>}
            {description && (
              <p className="text-muted-foreground pt-1 text-[0.8rem]">
                {linkifyDescription(sanitizeDescription(description))}
              </p>
            )}
            <input
              type="text"
              tabIndex={-1}
              required={required}
              value={items.length > 0 ? "true" : undefined}
              onChange={() => {}}
              style={{
                position: "absolute",
                opacity: 0,
                pointerEvents: "none",
                top: 0,
                left: 0,
              }}
            />
          </div>
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
                {linkifyDescription(sanitizeDescription(description))}
              </DialogDescription>
            )}
          </DialogHeader>
          <ArrayFieldItemForm
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
};
