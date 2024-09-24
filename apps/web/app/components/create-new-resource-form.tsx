import AutoForm from "~/components/ui/auto-form";
import { prepareOpenApiSchemaForAutoForm } from "~/lib/utils";
import { ZodObjectOrWrapped } from "~/components/ui/auto-form/utils";
import { ResourceType } from "@repo/shared";
import { Button } from "./ui/button";

export const CreateNewResourceForm = ({
  selectedResource,
  handleCreate,
  handleBack,
}: {
  selectedResource: ResourceType;
  handleCreate: (data: any) => void;
  handleBack: () => void;
}) => {
  return (
    <AutoForm
      className={"max-h-[800px] overflow-auto"}
      formSchema={
        prepareOpenApiSchemaForAutoForm(
          selectedResource?.openApiSchema,
        ) as ZodObjectOrWrapped
      }
      onSubmit={handleCreate}
    >
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          Back
        </Button>
        <Button type="submit">Create</Button>
      </div>
    </AutoForm>
  )
}