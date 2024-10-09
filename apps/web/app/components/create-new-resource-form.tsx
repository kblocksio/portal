import { ResourceType } from "@repo/shared";
import { FormGenerator, ObjectMetadata } from "./resource-form/resource-form";
import { useMemo } from "react";

export const CreateNewResourceForm = ({
  resourceType,
  initialValues,
  handleCreate,
  handleBack,
  isLoading,
}: {
  resourceType: ResourceType;
  initialValues?: any;
  handleCreate: (meta: ObjectMetadata, fields: any) => void;
  handleBack: () => void;
  isLoading: boolean;
}) => {

  const cleanedSchema = useMemo(() => {
    const schema = { ...resourceType.schema };
    delete schema.properties?.status;
    return schema;
  }, [resourceType.schema]);

  return (
    <div className="flex flex-col h-full">
      <FormGenerator
        schema={cleanedSchema}
        isLoading={isLoading}
        initialValues={initialValues}
        handleBack={handleBack}
        handleSubmit={handleCreate} />
    </div>
  )
}