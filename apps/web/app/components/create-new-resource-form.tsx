import { ResourceType } from "~/ResourceContext";
import { FormGenerator, ObjectMetadata } from "./resource-form/resource-form";
import { useMemo } from "react";
import { ApiObject } from "@kblocks/api";

export const CreateNewResourceForm = ({
  resourceType,
  initialValues,
  handleCreate,
  handleBack,
  isLoading,
  initialMeta,
}: {
  resourceType: ResourceType;
  initialValues?: ApiObject;
  initialMeta: Partial<ObjectMetadata>;
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
        initialMeta={initialMeta}
        handleBack={handleBack}
        handleSubmit={handleCreate} />
    </div>
  )
}