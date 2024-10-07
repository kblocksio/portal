import React, { createContext, useContext, useState, useCallback } from 'react';
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

  const openWizard = useCallback((editMode?: EditModeData) => {
    setEditModeData(editMode);
    setIsOpen(true);
  }, []);

  const closeWizard = useCallback(() => {
    setIsOpen(false);
    setEditModeData(undefined);
  }, []);

  const handleCreateResource = async (resourceType: any, providedValues: any) => {
    setIsLoading(true);
    await createResource({
      resourceType: resourceType,
      providedValues: providedValues,
    });
    setIsLoading(false);
    setIsOpen(false);
  };

  const handleEditResource = useCallback(async (resourceType: ResourceType, providedValues: any) => {
    setIsLoading(true);
    const updatedResource = {
      ...editModeData?.resource,
      ...providedValues,
    };
    await createResource({
      resourceType: resourceType,
      providedValues: updatedResource,
    });
    setIsLoading(false);
    setIsOpen(false);
  }, [editModeData]);

  const handleCreateOrEdit = useCallback(async (resourceType: ResourceType, providedValues: any) => {
    if (editModeData) {
      await handleEditResource(resourceType, providedValues);
    } else {
      await handleCreateResource(resourceType, providedValues);
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
        resourceTypes={Object.values(resourceTypes)}
        editModeData={editModeData}
      />
    </CreateResourceWizardContext.Provider>
  );
};