import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import React, { useCallback, useMemo, useState } from "react";
import { ResourceType } from "@repo/shared";
import { Loader } from "lucide-react";
import { ResourceTypesCards } from "./resource-types-cards";
import { WizardSearchHeader } from "./wizard-search-header";
import { WizardSimpleHeader } from "./wizard-simple-header";
import { CreateNewResourceForm } from "./create-new-resource-form";

export interface CreateResourceWizardProps {
  isOpen: boolean;
  isLoading: boolean;
  handleOnOpenChange: (open: boolean) => void;
  handleOnCreate: (resouce: any, providedValues: any) => void;
  resourceTypes: ResourceType[];
}

export const CreateResourceWizard = ({
  isOpen,
  isLoading,
  handleOnOpenChange,
  handleOnCreate,
  resourceTypes,
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
    if (!resourceTypes) return [];
    if (!searchQuery) return resourceTypes;
    return resourceTypes.filter((item: any) =>
      item.kind.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [resourceTypes, searchQuery]);

  const handleResourceSelect = (resource: any) => {
    setSelectedResource(resource);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setSelectedResource(null);
  };

  const handleCreate = useCallback((providedValues: any) => {
    if (!selectedResource) {
      return;
    }

    handleOnCreate(selectedResource, providedValues);
  }, [selectedResource, handleOnCreate]);

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
          {isLoading && <Loader className="ml-2 h-5 w-5 animate-spin" />}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]"
        onPointerDownOutside={(event) => {
          if (isLoading) {
            event.preventDefault()
          }
        }}
        onEscapeKeyDown={(event) => {
          if (isLoading) {
            event.preventDefault()
          }
        }}>
        <DialogHeader>
          <DialogTitle>
            {
              step === 1 ? (
                <WizardSearchHeader
                  title="Create a new resource"
                  description="Select the type of resource you want to create"
                  searchQuery={searchQuery}
                  handleSearch={handleSearch}
                />
              ) : (
                selectedResource &&
                <WizardSimpleHeader
                  title={`New ${selectedResource?.kind} resource`}
                  description={selectedResource?.description ||
                    "This is a mock description with a resonable length to see how it looks like"}
                  resourceType={selectedResource}
                />
              )
            }
          </DialogTitle>
        </DialogHeader>
        {
          step === 1 ? (
            <div className="grid h-[520px] grid-cols-3 gap-4 overflow-auto">
              <ResourceTypesCards filtereResources={filtereResources} handleResourceSelect={handleResourceSelect} />
            </div>
          ) : (
            <div className="space-y-4 p-2">
              {selectedResource &&
                <CreateNewResourceForm
                  selectedResource={selectedResource}
                  handleCreate={handleCreate}
                  handleBack={handleBack}
                  isLoading={isLoading}
                />}
            </div>
          )
        }
      </DialogContent>
    </Dialog>
  );
};
