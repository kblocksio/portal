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
import React, { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { ResourceType } from "@repo/shared";
import { getIconComponent, getResourceIconColors } from "~/lib/hero-icon";
import { Loader } from "lucide-react";
import AutoForm, { AutoFormSubmit } from "./ui/auto-form";
import { prepareOpenApiSchemaForAutoForm } from "~/lib/utils";
import { ZodObjectOrWrapped } from "~/components/ui/auto-form/utils";

export interface CreateResourceWizardProps {
  isOpen: boolean;
  isLoading: boolean;
  handleOnOpenChange: (open: boolean) => void;
  handleOnCreate: (resouce: any, providedValues: any) => void;
  resources: ResourceType[];
}

export const CreateResourceWizard = ({
  isOpen,
  isLoading,
  handleOnOpenChange,
  handleOnCreate,
  resources,
}: CreateResourceWizardProps) => {
  const [step, setStep] = useState(1);
  const [selectedResource, setSelectedResource] = useState<ResourceType | null>(
    null,
  );

  const handleResourceSelect = (resource: any) => {
    setSelectedResource(resource);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setSelectedResource(null);
  };

  const handleCreate = useCallback((providedValues: any) => {
    handleOnCreate(selectedResource, providedValues);
  }, [selectedResource, handleOnCreate]);

  const handleOpenChange = (open: boolean) => {
    handleOnOpenChange(open);
    setStep(1);
    setSelectedResource(null);
  };

  const SelectedResourceIcon = useMemo(() => {
    return getIconComponent({ icon: selectedResource?.icon });
  }, [selectedResource]);

  const selectedResourceIconColor = useMemo(() => {
    return getResourceIconColors({ color: selectedResource?.color });
  }, [selectedResource]);

  const StepTitle = useCallback(() => {
    return step === 1 ? (
      <>
        Create a new resource
        <p className="mt-2 text-sm text-gray-500">
          Select a resource type to add to your project
        </p>
      </>) : (
      <div className="flex items-center space-x-2">
        <div className="rounded-full p-2">
          <SelectedResourceIcon
            className={`${selectedResourceIconColor} h-7 w-7`}
          />
        </div>
        <div>
          <CardTitle>New {selectedResource?.kind} resource</CardTitle>
          <CardDescription className="mt-2">
            {selectedResource?.description ||
              "This is a mock description"}
          </CardDescription>
        </div>
      </div>
    )
  }, [step, selectedResource, selectedResourceIconColor, SelectedResourceIcon]);

  const StepContent = useCallback(() => {
    {
      return step === 1 ? (
        <div className="grid max-h-[600px] grid-cols-4 gap-4 overflow-auto">
          {resources.map((resource, index) => {
            const Icon = getIconComponent({ icon: resource.icon });
            const iconColor = getResourceIconColors({
              color: resource?.color,
            });
            return (
              <Card
                key={index}
                className="hover:bg-accent cursor-pointer"
                onClick={() => handleResourceSelect(resource)}
              >
                <CardHeader className="flex flex-row space-x-2 p-4">
                  <Icon className={`${iconColor} h-6 w-6`} />
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
        <div className="space-y-4 p-2">
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
        </div>
      )
    }
  }, [resources, step, handleBack, handleCreate, selectedResource]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button disabled={isLoading}>
          New Resource...
          {isLoading && <Loader className="ml-2 h-5 w-5" />}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>
            <StepTitle />
          </DialogTitle>
        </DialogHeader>
        <StepContent />
      </DialogContent>
    </Dialog>
  );
};
