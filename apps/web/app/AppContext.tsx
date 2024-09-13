import React, { createContext, useState, ReactNode, useContext } from "react";
import { Project } from "@repo/shared";

interface AppContextType {
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <AppContext.Provider value={{ selectedProject, setSelectedProject }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook for using the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
