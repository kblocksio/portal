import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { CreateResourceWizard } from "./components/resource-form/create-resource-wizard";
import { ResourceType, ResourceContext, Resource } from "./resource-context";
import { createResource } from "./lib/backend";
import { Category } from "@repo/shared";

interface CreateResourceWizardContextType {
  isOpen: boolean;
  isLoading: boolean;
  selectedResourceType: ResourceType | undefined;
  setSelectedResourceType: (resourceType: ResourceType | undefined) => void;
  openWizard: (
    currentEditableResource?: Resource,
    selectedResourceType?: ResourceType,
    step?: number,
  ) => void;
  closeWizard: () => void;
  categories: Record<string, Category>;
  step: number;
  setStep: (step: number) => void;
}

const CreateResourceWizardContext = createContext<
  CreateResourceWizardContextType | undefined
>(undefined);

export const useCreateResourceWizard = () => {
  const context = useContext(CreateResourceWizardContext);
  if (!context) {
    throw new Error(
      "useCreateResourceWizard must be used within a CreateResourceWizardProvider",
    );
  }
  return context;
};

interface CreateResourceWizardProviderProps {
  children: React.ReactNode;
}

export const CreateResourceWizardProvider: React.FC<
  CreateResourceWizardProviderProps
> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [currentEditableResource, setCurrentEditableResource] = useState<
    Resource | undefined
  >(undefined);
  const [selectedResourceType, setSelectedResourceType] = useState<
    ResourceType | undefined
  >(undefined);
  const { resourceTypes, categories } = useContext(ResourceContext);

  const filteredResourceTypes = useMemo(() => {
    return Object.values(resourceTypes).filter((r) => !r.kind?.endsWith("Ref"));
  }, [resourceTypes]);

  const openWizard = useCallback(
    (
      currentEditableResource?: Resource,
      selectedResourceType?: ResourceType,
      step?: number,
    ) => {
      setCurrentEditableResource(currentEditableResource);
      setSelectedResourceType(selectedResourceType);
      setStep(step || currentEditableResource ? 2 : 1);
      setIsOpen(true);
    },
    [],
  );

  const closeWizard = useCallback(() => {
    setIsOpen(false);
    setStep(1);
    setCurrentEditableResource(undefined);
    setSelectedResourceType(undefined);
  }, []);

  const handleCreateResource = async (
    system: string,
    resourceType: ResourceType,
    providedValues: any,
  ) => {
    setIsLoading(true);
    await createResource(system, resourceType, providedValues);
    setIsLoading(false);
    setIsOpen(false);
    setStep(1);
    setSelectedResourceType(undefined);
  };

  const handleEditResource = useCallback(
    async (system: string, resourceType: ResourceType, providedValues: any) => {
      setIsLoading(true);
      const updatedResource = {
        ...currentEditableResource,
        ...providedValues,
      };
      await createResource(system, resourceType, updatedResource);
      setIsLoading(false);
      setIsOpen(false);
      setStep(1);
      setCurrentEditableResource(undefined);
      setSelectedResourceType(undefined);
    },
    [currentEditableResource],
  );

  const handleCreateOrEdit = useCallback(
    async (system: string, resourceType: ResourceType, providedValues: any) => {
      if (currentEditableResource) {
        await handleEditResource(system, resourceType, providedValues);
      } else {
        await handleCreateResource(system, resourceType, providedValues);
      }
    },
    [currentEditableResource, handleCreateResource, handleEditResource],
  );

  const value = {
    isOpen,
    isLoading,
    selectedResourceType,
    setSelectedResourceType,
    openWizard,
    closeWizard,
    categories,
    step,
    setStep,
    currentEditableResource,
  };

  return (
    <CreateResourceWizardContext.Provider value={value}>
      {children}
      <CreateResourceWizard
        isOpen={isOpen}
        isLoading={isLoading}
        step={step}
        setStep={setStep}
        handleOnOpenChange={(open: boolean) => {
          if (open) {
            openWizard();
          } else {
            closeWizard();
          }
        }}
        handleOnCreate={handleCreateOrEdit}
        resourceTypes={filteredResourceTypes}
        currentEditableResource={currentEditableResource}
      />
    </CreateResourceWizardContext.Provider>
  );
};
