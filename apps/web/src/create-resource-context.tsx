import React, { createContext, useContext, useState } from "react";
import { createResource } from "./lib/backend";
import type { ExtendedResourceType } from "./hooks/use-resource-types";

interface CreateResourceContextType {
  isLoading: boolean;
  handleCreateOrEdit: (
    system: string,
    resourceType: ExtendedResourceType,
    providedValues: any,
  ) => Promise<void>;
}

const CreateResourceContext = createContext<
  CreateResourceContextType | undefined
>(undefined);

export const useCreateResource = () => {
  const context = useContext(CreateResourceContext);
  if (!context) {
    throw new Error(
      "useCreateResource must be used within a CreateResourceProvider",
    );
  }
  return context;
};

interface CreateResourceProviderProps {
  children: React.ReactNode;
}

export const CreateResourceProvider: React.FC<CreateResourceProviderProps> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateOrEdit = async (
    system: string,
    resourceType: ExtendedResourceType,
    providedValues: any,
  ) => {
    setIsLoading(true);
    await createResource(system, resourceType, providedValues);
    setIsLoading(false);
  };

  const value = {
    isLoading,
    handleCreateOrEdit,
  };

  return (
    <CreateResourceContext.Provider value={value}>
      {children}
    </CreateResourceContext.Provider>
  );
};
