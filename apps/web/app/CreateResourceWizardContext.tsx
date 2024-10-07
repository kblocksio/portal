import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { ResourceType } from "@repo/shared";
import { CreateResourceWizard, EditModeData } from './components/create-resource-wizard';
import { ResourceContext } from './ResourceContext';
import { createResource } from './lib/backend';

interface CreateResourceWizardContextType {
  isOpen: boolean;
  isLoading: boolean;
  openWizard: (editModeData?: EditModeData) => void;
  closeWizard: () => void;
}

const CreateResourceWizardContext = createContext<CreateResourceWizardContextType | undefined>(undefined);

export const useCreateResourceWizard = () => {
  const context = useContext(CreateResourceWizardContext);
  if (!context) {
    throw new Error('useCreateResourceWizard must be used within a CreateResourceWizardProvider');
  }
  return context;
};

interface CreateResourceWizardProviderProps {
  children: React.ReactNode;
}

export const CreateResourceWizardProvider: React.FC<CreateResourceWizardProviderProps> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editModeData, setEditModeData] = useState<EditModeData | undefined>(undefined);
  const { resourceTypes } = useContext(ResourceContext);

  const filteredResourceTypes = useMemo(() => {
    return Object.values(resourceTypes).filter(r => !r.kind?.endsWith("Ref"));
  }, [resourceTypes]);

  const openWizard = useCallback((editMode?: EditModeData) => {
    setEditModeData(editMode);
    setIsOpen(true);
  }, []);

  const closeWizard = useCallback(() => {
    setIsOpen(false);
    setEditModeData(undefined);
  }, []);

  const handleCreateResource = async (system: string, resourceType: ResourceType, providedValues: any) => {
    setIsLoading(true);
    await createResource(system, resourceType, providedValues);
    setIsLoading(false);
    setIsOpen(false);
  };

  const handleEditResource = useCallback(async (system: string, resourceType: ResourceType, providedValues: any) => {
    setIsLoading(true);
    const updatedResource = {
      ...editModeData?.resource,
      ...providedValues,
    };
    await createResource(system, resourceType, updatedResource);
    setIsLoading(false);
    setIsOpen(false);
  }, [editModeData]);

  const handleCreateOrEdit = useCallback(async (system: string, resourceType: ResourceType, providedValues: any) => {
    if (editModeData) {
      await handleEditResource(system, resourceType, providedValues);
    } else {
      await handleCreateResource(system, resourceType, providedValues);
    }
  }, [editModeData, handleCreateResource, handleEditResource]);

  const value = {
    isOpen,
    isLoading,
    openWizard,
    closeWizard,
  };

  return (
    <CreateResourceWizardContext.Provider value={value}>
      {children}
      <CreateResourceWizard
        isOpen={isOpen}
        isLoading={isLoading}
        handleOnOpenChange={(open: boolean) => {
          if (open) {
            openWizard();
          } else {
            closeWizard();
          }
        }}
        handleOnCreate={handleCreateOrEdit}
        resourceTypes={filteredResourceTypes}
        editModeData={editModeData}
      />
    </CreateResourceWizardContext.Provider>
  );
};