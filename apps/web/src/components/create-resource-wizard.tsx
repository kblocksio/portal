import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ResourceTypesCards } from "./resource-types-cards";
import { WizardSearchHeader } from "./wizard-search-header";
import { WizardSimpleHeader } from "./wizard-simple-header";
import { CreateNewResourceForm } from "./create-new-resource-form";
import { ApiObject, parseBlockUri } from "@kblocks/api";
import { Resource, ResourceType } from "~/resource-context";
import { useCreateResourceWizard } from "~/create-resource-wizard-context";
import { ObjectMetadata } from "@repo/shared";

export interface EditModeData {
  resourceType: ResourceType;
  resource: Resource;
}

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
  const [step, setStep] = useState(editModeData ? 2 : 1);
  const [selectedResourceType, setSelectedResourceType] =
    useState<ResourceType | null>(
      editModeData ? editModeData.resourceType : null,
    );
  const [searchQuery, setSearchQuery] = useState("");
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const { setSelectedResourceType: updateSelectedResourceTypeInContext } =
    useCreateResourceWizard();

  useEffect(() => {
    setStep(editModeData ? 2 : 1);
    setSelectedResourceType(editModeData?.resourceType || null);
  }, [editModeData]);

  const filtereResources = useMemo(() => {
    if (!resourceTypes) return [];
    if (!searchQuery) return resourceTypes;
    return resourceTypes.filter((item: any) =>
      item.kind.toLowerCase().includes(searchQuery?.toLowerCase()),
    );
  }, [resourceTypes, searchQuery]);

  const handleResourceSelect = (resourceType: ResourceType) => {
    setSelectedResourceType(resourceType);
    updateSelectedResourceTypeInContext(resourceType);
    setStep(2);
  };

  const handleBack = useCallback(() => {
    if (editModeData) {
      handleOnOpenChange(false);
    } else {
      setStep(1);
      setSelectedResourceType(null);
      updateSelectedResourceTypeInContext(undefined);
    }
  }, [
    editModeData,
    handleOnOpenChange,
    setStep,
    setSelectedResourceType,
    updateSelectedResourceTypeInContext,
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
      setStep(editModeData ? 2 : 1);
      setSelectedResourceType(editModeData?.resourceType || null);
    },
    [editModeData, handleOnOpenChange, setStep, setSelectedResourceType],
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
                  title={`${editModeData ? "Edit" : "New"} ${selectedResourceType?.kind} resource`}
                  description={selectedResourceType?.description || ""}
                  resourceType={selectedResourceType}
                />
              )
            )}
          </DialogTitle>
        </DialogHeader>
        {step === 1 ? (
          <div className="grid grid-cols-3 gap-4 overflow-auto">
            <ResourceTypesCards
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
                initialMeta={renderInitialMeta(editModeData?.resource?.objUri)}
                initialValues={editModeData?.resource}
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
