import { ObjectMetadata } from "@repo/shared";
import { getDataByPath, isObjectPopulated, updateDataByPath } from "./utils";
import { ObjectFieldForm } from "./object-field-form";
import { FieldRenderer } from "./field-renderer";
import { FormFields } from "./form-fields";
import { linkifyDescription, sanitizeDescription } from "./description-parser";
import { splitAndCapitalizeCamelCase } from "@/lib/utils";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Check, Pencil } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

export const ObjectFieldRenderer = ({
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
}) => {
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
            {linkifyDescription(sanitizeDescription(description))}
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
                {linkifyDescription(sanitizeDescription(description))}
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
                {linkifyDescription(sanitizeDescription(description))}
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
};
