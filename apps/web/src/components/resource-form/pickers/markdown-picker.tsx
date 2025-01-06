import { Textarea } from "@/components/ui/textarea";
import { Field } from "../form-field";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MarkdownWrapper } from "@/components/markdown";
import { EyeIcon } from "lucide-react";
import { PencilIcon } from "lucide-react";

export const MarkdownPicker = ({
  fieldName,
  required,
  description,
  onChange,
  hideField,
  value,
}: {
  fieldName: string;
  required: boolean;
  description?: string;
  onChange: (value: string) => void;
  hideField?: boolean;
  value: string;
}) => {
  const [isPreview, setIsPreview] = useState(false);

  return (
    <Field
      fieldName={fieldName}
      required={required}
      description={description}
      hideField={hideField}
      showLabel={true}
    >
      <div className="relative">
        <div className="absolute right-6 top-2">
          <Button
            type="button"
            onClick={() => setIsPreview(!isPreview)}
            variant="outline"
            size="sm"
          >
            {isPreview ? (
              <PencilIcon className="h-4 w-4" />
            ) : (
              <EyeIcon className="h-4 w-4" />
            )}
          </Button>
        </div>

        {isPreview ? (
          <div className="prose prose-sm max-h-[650px] overflow-auto rounded-md border p-4">
            <MarkdownWrapper content={value} />
          </div>
        ) : (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-[250px]"
          />
        )}
      </div>
    </Field>
  );
};
