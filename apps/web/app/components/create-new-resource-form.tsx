import { ResourceType } from "@repo/shared";
import { FormGenerator } from "./resource-form/resource-form";
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
  handleCreate: (data: any) => void;
  handleBack: () => void;
  isLoading: boolean;
}) => {

  const cleanedSchema = useMemo(() => {
    const schema = { ...resourceType.schema };
    delete schema.properties?.status;
    return schema;
  }, [resourceType.schema]);

  return (
    <FormGenerator
      schema={cleanedSchema}
      isLoading={isLoading}
      initialValues={initialValues}
      handleBack={handleBack}
      handleSubmit={handleCreate} />
  )
}