import { ResourceType } from "@/resource-context";
import { FormGenerator } from "./resource-form/resource-form";
import { ApiObject } from "@kblocks/api";
import { ObjectMetadata } from "@repo/shared";

export const CreateNewResourceForm = ({
  resourceType,
  initialValues,
  handleCreate,
  handleBack,
  isLoading,
  initialMeta,
  readonly,
}: {
  resourceType: ResourceType;
  initialValues?: ApiObject;
  initialMeta: Partial<ObjectMetadata>;
  handleCreate?: (meta: ObjectMetadata, fields: any) => void;
  handleBack?: () => void;
  isLoading: boolean;
  readonly?: boolean;
}) => {
  delete resourceType.schema.properties?.orderedJson;

  return (
    <div className="flex h-full flex-col">
      <FormGenerator
        schema={resourceType.schema}
        isLoading={isLoading}
        initialValues={initialValues}
        initialMeta={initialMeta}
        handleBack={handleBack}
        handleSubmit={handleCreate}
        readonly={readonly}
      />
    </div>
  );
};
