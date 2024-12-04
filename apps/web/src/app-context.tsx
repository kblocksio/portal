import React, {
  createContext,
  useState,
  ReactNode,
  useContext,
  type DependencyList,
  useEffect,
} from "react";
import { Project } from "@repo/shared";

export interface BreadcrumbItem {
  name: string;
  url?: string;
}

interface AppContextType {
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  breadcrumbs: BreadcrumbItem[];
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  return (
    <AppContext.Provider
      value={{
        selectedProject,
        setSelectedProject,
        breadcrumbs,
        setBreadcrumbs,
      }}
    >
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

export const useBreadcrumbs = (
  breadcrumbs: BreadcrumbItem[] | (() => BreadcrumbItem[]),
  deps: DependencyList = [],
) => {
  const { setBreadcrumbs } = useAppContext();

  useEffect(() => {
    setBreadcrumbs(Array.isArray(breadcrumbs) ? breadcrumbs : breadcrumbs());
  }, [setBreadcrumbs, ...deps]);
};
