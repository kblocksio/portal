import React, { createContext, useState, ReactNode, useContext } from "react";
import { Project } from "./resource-context";
import { usePreviousRoute } from "./hooks/usePreviousRoute";

interface LocationContextType {
  previousRoute: string | null;
}

export const LocationContext = createContext<LocationContextType | undefined>(
  undefined,
);

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({
  children,
}) => {
  const previousRoute = usePreviousRoute();

  return (
    <LocationContext.Provider
      value={{
        previousRoute,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};
