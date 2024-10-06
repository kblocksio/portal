import { ResourceType } from "@repo/shared";
import { FormGenerator } from "./resource-form/resource-form";
import { useMemo } from "react";

export const CreateNewResourceForm = ({
  selectedResourceType,
  handleCreate,
  handleBack,
  isLoading,
}: {
  selectedResourceType: ResourceType;
  handleCreate: (data: any) => void;
  handleBack: () => void;
  isLoading: boolean;
}) => {

  const cleanedSchema = useMemo(() => {
    const schema = { ...selectedResourceType.openApiSchema };
    delete schema.properties?.status;
    return schema;
  }, [selectedResourceType.openApiSchema]);

  return (
    <FormGenerator
      schema={cleanedSchema}
      isLoading={isLoading}
      handleBack={handleBack}
      handleSubmit={handleCreate} />
  )
}