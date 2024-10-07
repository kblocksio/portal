import { useCallback, useState } from 'react';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import { FieldRenderer } from './field-renderer';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

export interface FormGeneratorProps {
  schema: any,
  isLoading: boolean,
  handleBack: () => void,
  handleSubmit: (formData: any) => void,
  initialValues?: any;
};

export const FormGenerator = ({ schema, isLoading, handleBack, handleSubmit, initialValues }: FormGeneratorProps) => {
  const [formData, setFormData] = useState<any>(initialValues || {});
  const [system] = useState<string>("demo");
  const [namespace, setNamespace] = useState<string>(initialValues?.metadata?.namespace || "");
  const [name, setName] = useState<string>(initialValues?.metadata?.name || "");

  const updateFormData = useCallback((newData: any) => {
    newData.metadata = {
      name,
      namespace,
      system,
    };
    setFormData(newData);
  }, [name, namespace, system]);

  return (
    <form className="space-y-4 overflow-hidden max-h-[80vh]" onSubmit={(e) => {
      e.preventDefault();
      handleSubmit(formData);
    }}>
      <div className="space-y-4 border-b pb-4 ml-2 mr-2">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className={`${!!initialValues ? "opacity-50" : ""}`}>Name</Label>
            <Input id="name" placeholder="Resource name" disabled={!!initialValues} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="namespace" className={`${!!initialValues ? "opacity-50" : ""}`}>Namespace</Label>
            <Input id="namespace" placeholder="Namespace" disabled={!!initialValues} value={namespace} onChange={(e) => setNamespace(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="system" className={"opacity-50"}>System</Label>
            <Input id="system" placeholder="System" disabled={true} value="demo" />
          </div>
        </div>
      </div>
      <div className="space-y-4 pb-4 overflow-y-auto max-h-[60vh]">
        <FieldRenderer
          schema={schema}
          path=""
          formData={formData}
          updateFormData={updateFormData}
          hideField={true}
        />
      </div>
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          Back
        </Button>
        <Button type='submit' disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {initialValues ? "Editing..." : "Creating..."}
            </>
          ) : (
            initialValues ? "Edit" : "Create"
          )}
        </Button>
      </div>

      {/* <pre className="mt-4 bg-gray-100 p-2 rounded">
        {JSON.stringify(formData, null, 2)}
      </pre> */}
    </form >
  );
};
