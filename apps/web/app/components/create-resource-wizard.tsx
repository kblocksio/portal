import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useState } from "react";
import { CRD } from "@repo/shared";
import { getIconComponent, getResourceIconColors } from "~/lib/hero-icon";
import { Loader } from "lucide-react";
import AutoForm from "./ui/auto-form";
import { prepareOpenApiSchemaForAutoForm } from "~/lib/utils";
import { ZodObjectOrWrapped } from "~/components/ui/auto-form/utils";

export interface CreateResourceWizardProps {
  isOpen: boolean;
  isLoading: boolean;
  handleOnOpenChange: (open: boolean) => void;
  handleOnCreate: (resource: any) => void;
  resources: CRD[];
}

export const CreateResourceWizard = ({
  isOpen,
  isLoading,
  handleOnOpenChange,
  handleOnCreate,
  resources,
}: CreateResourceWizardProps) => {
  const [step, setStep] = useState(1);
  const [selectedResource, setSelectedResource] = useState<CRD | null>(null);

  const handleResourceSelect = (resource: any) => {
    setSelectedResource(resource);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setSelectedResource(null);
  };

  const handleCreate = () => {
    handleOnCreate(selectedResource);
    setStep(1);
    setSelectedResource(null);
  };

  const handleOpenChange = (open: boolean) => {
    handleOnOpenChange(open);
    setStep(1);
    setSelectedResource(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button disabled={isLoading}>
          New Resource...
          {isLoading && <Loader className="h-5 w-5 ml-2" />}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>
            {step === 1
              ? "Select Resource Type"
              : `Configure ${selectedResource?.kind || "Resource"}`}
          </DialogTitle>
        </DialogHeader>
        {step === 1 ? (
          <div className="grid grid-cols-3 gap-4">
            {resources.map((resource, index) => {
              const Icon = getIconComponent({ icon: resource.icon });
              const iconColor = getResourceIconColors({
                color: resource?.color,
              });
              return (
                <Card
                  key={index}
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => handleResourceSelect(resource)}
                >
                  <CardHeader>
                    <Icon className={`${iconColor} w-8 h-8 mb-2`} />
                    <CardTitle>{resource.kind}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      {resource.description ||
                        "This is a mock description for now"}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            <AutoForm
              className={"overflow-auto max-h-[800px]"}
              formSchema={
                prepareOpenApiSchemaForAutoForm(
                  selectedResource?.openApiSchema,
                ) as ZodObjectOrWrapped
              }
            />
            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleCreate}>Create</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
