import { Label } from "../ui/label";
import { linkifyDescription, sanitizeDescription } from "./description-parser";
import { splitAndCapitalizeCamelCase } from "./label-formater";

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
              {linkifyDescription(sanitizedDescription)}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};
