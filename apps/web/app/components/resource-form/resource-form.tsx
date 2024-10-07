import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import { FieldRenderer } from './field-renderer';

export interface FormGeneratorProps {
  schema: any,
  isLoading: boolean,
  handleBack: () => void,
  handleSubmit: (formData: any) => void,
  initialValues?: any;
};

export const FormGenerator = ({ schema, isLoading, handleBack, handleSubmit, initialValues }: FormGeneratorProps) => {
  const [formData, setFormData] = useState<any>(initialValues || {});

  const updateFormData = (newData: any) => {
    setFormData(newData);
  };

  return (
    <form className="space-y-4 overflow-hidden max-h-[80vh]" onSubmit={(e) => {
      e.preventDefault();
      handleSubmit(formData);
    }}>
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
    </form>
  );
};
