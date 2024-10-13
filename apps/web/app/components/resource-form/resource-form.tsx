import { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import { FieldRenderer } from './field-renderer';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { ApiObject } from '@kblocks/api';

export interface ObjectMetadata {
  name: string;
  namespace: string;
  system: string;
}

export interface FormGeneratorProps {
  schema: any,
  isLoading: boolean,
  handleBack: () => void,
  handleSubmit: (meta: ObjectMetadata, fields: any) => void,
  initialValues?: ApiObject;
  initialMeta: Partial<ObjectMetadata>;
};

export const FormGenerator = ({ schema, isLoading, handleBack, handleSubmit, initialValues, initialMeta }: FormGeneratorProps) => {
  const [formData, setFormData] = useState<any>(initialValues || {});
  const [system] = useState<string>(initialMeta?.system ?? "demo");
  const [namespace, setNamespace] = useState<string>(initialMeta?.namespace ?? "default");
  const [name, setName] = useState<string>(initialMeta?.name ?? "");
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Focus on the name input when it's empty
  useEffect(() => {
    if (name.length === 0 && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [name]);

  useEffect(() => {
    console.log("formData", formData);
  }, [formData]);

  return (
    <form className="flex flex-col h-full space-y-4 overflow-hidden" onSubmit={(e) => {
      e.preventDefault();
      const meta: ObjectMetadata = {
        name,
        namespace,
        system,
      };

      handleSubmit(meta, formData);
    }}>
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4 border-b pb-4 mb-8 ml-2 mr-2">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className={`${initialValues ? "opacity-50" : ""}`}>Name</Label>
              <Input
                required
                id="name"
                placeholder="Resource name"
                disabled={!!initialValues}
                value={name}
                onChange={(e) => setName(e.target.value)}
                ref={nameInputRef}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="namespace" className={`${initialValues ? "opacity-50" : ""}`}>Namespace</Label>
              <Input required id="namespace" placeholder="Namespace" disabled={!!initialValues} value={namespace} onChange={(e) => setNamespace(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="system" className={"opacity-50"}>System</Label>
              <Input required id="system" placeholder="System" disabled={true} value={system} />
            </div>
          </div>
        </div>
        <div className="space-y-4 pb-4 overflow-y-auto max-h-[60vh]">
          <FieldRenderer
            schema={schema}
            path=""
            formData={formData}
            updateFormData={setFormData}
            hideField={true}
          />
        </div>
      </div>
      <div className="flex justify-between pt-4 border-t border-gray-200">
        <Button variant="outline" onClick={handleBack}>
          Back
        </Button>
        <Button type='submit' disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {initialValues ? "Updating..." : "Creating..."}
            </>
          ) : (
            initialValues ? "Update" : "Create"
          )}
        </Button>
      </div>
    </form>
  );
};
