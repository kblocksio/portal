import AutoForm from "~/components/ui/auto-form";
import { prepareOpenApiSchemaForAutoForm } from "~/lib/utils";
import { ZodObjectOrWrapped } from "~/components/ui/auto-form/utils";
import { ResourceType } from "@repo/shared";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import FormGenerator from "./resource-form";
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
    <FormGenerator schema={cleanedSchema} />
  )
}