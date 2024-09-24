import AutoForm from "~/components/ui/auto-form";
import { prepareOpenApiSchemaForAutoForm } from "~/lib/utils";
import { ZodObjectOrWrapped } from "~/components/ui/auto-form/utils";
import { ResourceType } from "@repo/shared";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";

export const CreateNewResourceForm = ({
  selectedResource,
  handleCreate,
  handleBack,
  isLoading,
}: {
  selectedResource: ResourceType;
  handleCreate: (data: any) => void;
  handleBack: () => void;
  isLoading: boolean;
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
        <Button type="submit" disabled={isLoading}>
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
    </AutoForm>
  )
}