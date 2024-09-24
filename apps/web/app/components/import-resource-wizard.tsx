import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import {
  CardDescription,
  CardTitle,
} from "~/components/ui/card";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ResourceType } from "@repo/shared";
import { getIconComponent, getResourceIconColors } from "~/lib/hero-icon";
import { Loader, Search } from "lucide-react";
import { Input } from "./ui/input";
import { ImportGHRepo } from "./import-gh-repo";
import { ResourceTypesCards } from "./resource-types-cards";
import { WizardSearchHeader } from "./wizard-search-header";
import { WizardSimpleHeader } from "./wizard-simple-header";

export interface ImportResourceWizardProps {
  isOpen: boolean;
  isLoading: boolean;
  handleOnOpenChange: (open: boolean) => void;
  handleOnCreate: (resouce: any, providedValues: any) => void;
  resourceTypes: ResourceType[];
}

export const ImportResourceWizard = ({
  isOpen,
  isLoading,
  handleOnOpenChange,
  handleOnCreate,
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

  const handleCreate = useCallback((providedValues: any) => {
    handleOnCreate(selectedResource, providedValues);
  }, [selectedResource, handleOnCreate]);

  const handleOpenChange = (open: boolean) => {
    handleOnOpenChange(open);
    setStep(1);
    setSelectedResource(null);
  };

  const StepContent = useCallback(() => {
    return step === 1 ? (
      <div className="grid h-[520px] grid-cols-3 gap-4 overflow-auto">
        <ResourceTypesCards filtereResources={filtereResources} handleResourceSelect={handleResourceSelect} />
      </div>
    ) : (
      <div className="space-y-4 p-2">
        <ImportGHRepo handleBack={handleBack} />
      </div>
    )
  }, [filtereResources, step, handleBack, handleCreate, selectedResource]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button disabled={isLoading}>
          Import...
          {isLoading && <Loader className="ml-2 h-5 w-5" />}
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
        <StepContent />
      </DialogContent>
    </Dialog>
  );
};
