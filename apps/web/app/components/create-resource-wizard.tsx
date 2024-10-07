import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ResourceType } from "@repo/shared";
import { ResourceTypesCards } from "./resource-types-cards";
import { WizardSearchHeader } from "./wizard-search-header";
import { WizardSimpleHeader } from "./wizard-simple-header";
import { CreateNewResourceForm } from "./create-new-resource-form";

export interface EditModeData {
  resourceType: ResourceType;
  initialValues: any;
}

export interface CreateResourceWizardProps {
  isOpen: boolean;
  isLoading: boolean;
  handleOnOpenChange: (open: boolean) => void;
  handleOnCreate: (resouce: ResourceType, providedValues: any) => void;
  resourceTypes: ResourceType[];
  editModeData?: EditModeData;
}

export const CreateResourceWizard = ({
  isOpen,
  isLoading,
  handleOnOpenChange,
  handleOnCreate,
  resourceTypes,
  editModeData,
}: CreateResourceWizardProps) => {
  const [step, setStep] = useState(!!editModeData ? 2 : 1);
  const [selectedResourceType, setSelectedResourceType] = useState<ResourceType | null>(
    editModeData ? editModeData.resourceType : null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const filtereResources = useMemo(() => {
    if (!resourceTypes) return [];
    if (!searchQuery) return resourceTypes;
    return resourceTypes.filter((item: any) =>
      item.kind.toLowerCase().includes(searchQuery?.toLowerCase()),
    );
  }, [resourceTypes, searchQuery]);

  const handleResourceSelect = (resource: any) => {
    setSelectedResourceType(resource);
    setStep(2);
  };

  const handleBack = () => {
    if (editModeData) {
      handleOnOpenChange(false);
    } else {
      setStep(1);
      setSelectedResourceType(null);
    }
  };

  const handleCreate = useCallback((providedValues: any) => {
    if (!selectedResourceType) {
      return;
    }
    handleOnCreate(selectedResourceType, providedValues);
  }, [selectedResourceType, handleOnCreate]);

  const handleOpenChange = (open: boolean) => {
    handleOnOpenChange(open);
    setStep(editModeData ? 2 : 1);
    setSelectedResourceType(editModeData?.resourceType || null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          {!!editModeData ? "Edit" : "New Resource..."}
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
                selectedResourceType &&
                <WizardSimpleHeader
                  title={`${!!editModeData ? "Edit" : "New"} ${selectedResourceType?.kind} resource`}
                  description={selectedResourceType?.description || ""}
                  resourceType={selectedResourceType}
                />
              )
            }
          </DialogTitle>
        </DialogHeader>
        {
          step === 1 ? (
            <div className="grid h-[520px] grid-cols-3 gap-4 overflow-auto">
              <ResourceTypesCards
                isLoading={isLoading}
                filtereResources={filtereResources}
                handleResourceSelect={handleResourceSelect} />
            </div>
          ) : (
            <div className="space-y-4 p-2">
              {selectedResourceType &&
                <CreateNewResourceForm
                  selectedResourceType={selectedResourceType}
                  initialValues={editModeData?.initialValues}
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
