import { useState } from 'react';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import { FieldRenderer } from './field-renderer';

export interface FormGeneratorProps {
  schema: any,
  isLoading: boolean,
  handleBack: () => void,
  handleSubmit: () => void,
};

export const FormGenerator = ({ schema, isLoading, handleBack, handleSubmit }: FormGeneratorProps) => {
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
        hideField={true}
      />
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          Back
        </Button>
        <Button type='button' onClick={() => console.log(formData)} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create"
          )}
        </Button>
      </div>

      <pre className="mt-4 bg-gray-100 p-2 rounded">
        {JSON.stringify(formData, null, 2)}
      </pre>
    </form>
  );
};
