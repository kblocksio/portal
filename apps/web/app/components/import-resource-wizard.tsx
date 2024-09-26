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
import { ImportGHRepo } from "./import-gh-repo";
import { ResourceTypesCards } from "./resource-types-cards";
import { WizardSearchHeader } from "./wizard-search-header";
import { WizardSimpleHeader } from "./wizard-simple-header";

export interface ImportResourceWizardProps {
  isOpen: boolean;
  isLoading: boolean;
  handleOnOpenChange: (open: boolean) => void;
  handleOnImport: (newResources: { resourceType: any, providedValues: any[] }) => void;
  resourceTypes: ResourceType[];
}

export const ImportResourceWizard = ({
  isOpen,
  isLoading,
  handleOnOpenChange,
  handleOnImport,
  resourceTypes,
}: ImportResourceWizardProps) => {
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

  const handleImportResources = useCallback((selectedTypeProvidedValues: any[]) => {
    handleOnImport({ resourceType: selectedResource, providedValues: selectedTypeProvidedValues });
  }, [handleOnImport, selectedResource]);

  const handleOpenChange = (open: boolean) => {
    handleOnOpenChange(open);
    setStep(1);
    setSelectedResource(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button disabled={isLoading}>
          Import...
          {isLoading && <Loader className="ml-2 h-5 w-5 animate-spin" />}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>
            {
              step === 1 ? (
                <WizardSearchHeader
                  title="Import existing resources to your project"
                  description="Connect to an external system and import existing resources to be managed in your project"
                  searchQuery={searchQuery}
                  handleSearch={handleSearch}
                />
              ) : (
                selectedResource &&
                <WizardSimpleHeader
                  title={`Import ${selectedResource?.kind} resources to your project`}
                  description="Select the repositories you want to import into your project"
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
            selectedResource?.kind === 'RepositoryRef' ? (
              <div className="space-y-4 p-2">
                <ImportGHRepo handleBack={handleBack} handleOnImport={handleImportResources} />
              </div>
            ) : null
          )
        }
      </DialogContent>
    </Dialog>
  );
};
