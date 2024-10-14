import { ResourceType } from "~/ResourceContext";
import { FormGenerator } from "./resource-form/resource-form";
import { useMemo } from "react";
import { ApiObject } from "@kblocks/api";
import { ObjectMetadata } from "@repo/shared";

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

  const sanitizedOrderedSchema = useMemo(() => {
    let orderedSchema = null;
    try {
      orderedSchema = JSON.parse(resourceType.schema.properties?.orderedJson);
    } catch (e) {
      console.error("Error parsing ordered schema fallback to full schema", e);
      orderedSchema = resourceType.schema;
    }
    const schema = { ...orderedSchema };
    delete schema.properties?.status;
    delete schema.properties?.orderedJson;
    return schema;
  }, [resourceType.schema]);

  return (
    <div className="flex flex-col h-full">
      <FormGenerator
        schema={sanitizedOrderedSchema}
        isLoading={isLoading}
        initialValues={initialValues}
        initialMeta={initialMeta}
        handleBack={handleBack}
        handleSubmit={handleCreate} />
    </div>
  )
}