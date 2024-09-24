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
import { Loader, Search } from "lucide-react";
import AutoForm, { AutoFormSubmit } from "./ui/auto-form";
import { prepareOpenApiSchemaForAutoForm } from "~/lib/utils";
import { ZodObjectOrWrapped } from "~/components/ui/auto-form/utils";
import { Input } from "./ui/input";

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
  const [searchQuery, setSearchQuery] = useState("");
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const filtereResources = useMemo(() => {
    if (!resources) return [];
    if (!searchQuery) return resources;
    return resources.filter((item: any) =>
      item.kind.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [resources, searchQuery]);

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

  const StepContent = useCallback(() => {
    return step === 1 ? (
      <div className="grid h-[520px] grid-cols-3 gap-4 overflow-auto">
        {filtereResources.map((resource, index) => {
          const Icon = getIconComponent({ icon: resource.icon });
          const iconColor = getResourceIconColors({
            color: resource?.color,
          });
          return (
            <Card
              key={index}
              className="hover:bg-accent cursor-pointer max-h-[160px] flex flex-col justify-center"
              onClick={() => handleResourceSelect(resource)}
            >
              <CardHeader className="flex flex-row h-[50px] text-center border-b border-b-gray-200 items-center align-middle">
                <div className="w-full flex self-center items-center justify-center">
                  <Icon className={`${iconColor} h-7 w-7`} />
                </div>
              </CardHeader>
              <CardContent className="flex p-2 flex-col h-[110px]">
                <CardTitle className="mb-2">{resource.kind}</CardTitle>
                <CardDescription>
                  {resource.description ||
                    "This is a mock description with a reasonable length to see how it looks like"}
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
  }, [filtereResources, step, handleBack, handleCreate, selectedResource]);

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
            {
              step === 1 ? (
                <>
                  Create a new resource
                  <p className="mt-2 text-sm text-gray-500">
                    Select a resource type to add to your project
                  </p>
                  <div className="relative flex-grow mt-4 mb-2">
                    <Search className="text-muted-foreground absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform" />
                    <Input
                      type="text"
                      placeholder="Search resource..."
                      value={searchQuery}
                      onChange={handleSearch}
                      className="bg-color-wite h-10 w-full py-2 pl-8 pr-4"
                    />
                  </div>
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
                        "This is a mock description with a resonable length to see how it looks like"}
                    </CardDescription>
                  </div>
                </div>
              )
            }
          </DialogTitle>
        </DialogHeader>
        <StepContent />
      </DialogContent>
    </Dialog>
  );
};
