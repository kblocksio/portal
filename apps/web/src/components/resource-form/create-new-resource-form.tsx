import { ApiObject } from "@kblocks/api";
import cloneDeep from "lodash.clonedeep";
import { ResourceType } from "@/resource-context";
import { FormGenerator } from "./resource-form";
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
  const schema = cloneDeep(resourceType.schema);
  delete schema.properties?.orderedJson;
  delete schema.properties?.status;

  return (
    <div className="flex h-full flex-col">
      <FormGenerator
        resourceType={resourceType}
        isLoading={isLoading}
        initialValues={initialValues}
        initialMeta={initialMeta}
        handleBack={handleBack}
        handleSubmit={handleCreate}
      />
    </div>
  );
};
