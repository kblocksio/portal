import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ResourceTypesCatalog } from "./resource-types-catalog";
import { WizardSearchHeader } from "./wizard-search-header";
import { WizardSimpleHeader } from "./wizard-simple-header";
import { CreateNewResourceForm } from "./create-new-resource-form";
import { ApiObject, parseBlockUri } from "@kblocks/api";
import { Resource, ResourceType } from "~/resource-context";
import { useCreateResourceWizard } from "~/create-resource-wizard-context";
import { ObjectMetadata } from "@repo/shared";

export interface CreateResourceWizardProps {
  isOpen: boolean;
  isLoading: boolean;
  handleOnOpenChange: (open: boolean) => void;
  handleOnCreate: (
    system: string,
    resourceType: ResourceType,
    obj: ApiObject,
  ) => void;
  resourceTypes: ResourceType[];
  currentEditableResource?: Resource;
  step: number;
  setStep: (step: number) => void;
}

export const CreateResourceWizard = ({
  isOpen,
  isLoading,
  handleOnOpenChange,
  handleOnCreate,
  resourceTypes,
  step,
  setStep,
  currentEditableResource,
}: CreateResourceWizardProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const { selectedResourceType, setSelectedResourceType, categories } =
    useCreateResourceWizard();

  const filtereResources = useMemo(() => {
    if (!resourceTypes) return [];
    if (!searchQuery) return resourceTypes;
    return resourceTypes.filter((item: any) =>
      item.kind.toLowerCase().includes(searchQuery?.toLowerCase()),
    );
  }, [resourceTypes, searchQuery]);

  const handleResourceSelect = (resourceType: ResourceType) => {
    setSelectedResourceType(resourceType);
    setStep(2);
  };

  const handleBack = useCallback(() => {
    if (currentEditableResource) {
      handleOnOpenChange(false);
    } else {
      setStep(1);
      setSelectedResourceType(undefined);
    }
  }, [
    currentEditableResource,
    handleOnOpenChange,
    setStep,
    setSelectedResourceType,
  ]);

  const handleCreate = useCallback(
    (meta: ObjectMetadata, values: any) => {
      if (!selectedResourceType) {
        return;
      }

      delete values.metadata?.system;

      handleOnCreate(meta.system, selectedResourceType, {
        apiVersion: `${selectedResourceType.group}/${selectedResourceType.version}`,
        kind: selectedResourceType.kind,
        metadata: {
          name: meta.name,
          namespace: meta.namespace,
        },
        ...values,
      });
    },
    [selectedResourceType, handleOnCreate],
  );

  const handleOpenChange = useCallback(
    (open: boolean) => {
      handleOnOpenChange(open);
      setSelectedResourceType(undefined);
    },
    [currentEditableResource, handleOnOpenChange, setSelectedResourceType],
  );

  function renderInitialMeta(objUri?: string): Partial<ObjectMetadata> {
    if (!objUri) {
      return {};
    }

    const uri = parseBlockUri(objUri);
    return {
      system: uri.system,
      namespace: uri.namespace,
      name: uri.name,
    };
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="flex h-[90vh] min-w-[90vh] flex-col"
        aria-describedby="Create a new resource"
        onPointerDownOutside={(event) => {
          if (isLoading) {
            event.preventDefault();
          }
        }}
        onEscapeKeyDown={(event) => {
          if (isLoading) {
            event.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? (
              <WizardSearchHeader
                title="Create a new resource"
                description="Select the type of resource you want to create"
                searchQuery={searchQuery}
                handleSearch={handleSearch}
              />
            ) : (
              selectedResourceType && (
                <WizardSimpleHeader
                  title={`${currentEditableResource ? "Edit" : "New"} ${selectedResourceType?.kind} resource`}
                  description={selectedResourceType?.description || ""}
                  resourceType={selectedResourceType}
                />
              )
            )}
          </DialogTitle>
        </DialogHeader>
        {step === 1 ? (
          <div className="w-full gap-4 overflow-auto p-2">
            <ResourceTypesCatalog
              categories={categories}
              isLoading={isLoading}
              filtereResources={filtereResources}
              handleResourceSelect={handleResourceSelect}
            />
          </div>
        ) : (
          <div className="flex h-full flex-col space-y-4 overflow-hidden p-2">
            {selectedResourceType && (
              <CreateNewResourceForm
                resourceType={selectedResourceType}
                initialMeta={renderInitialMeta(currentEditableResource?.objUri)}
                initialValues={currentEditableResource}
                handleCreate={handleCreate}
                handleBack={handleBack}
                isLoading={isLoading}
              />
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
