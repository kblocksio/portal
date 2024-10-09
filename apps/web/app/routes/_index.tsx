import { useAppContext } from "~/AppContext";
import { useContext, useState } from "react";
import { createResource } from "~/lib/backend";
import { Skeleton } from "~/components/ui/skeleton";
import { ResourceContext } from "~/ResourceContext";
import { ResourceType } from "@repo/shared";
import { ApiObject } from "@kblocks/api";
import { Search } from "lucide-react";
import { ProjectHeader } from "~/components/project-header";
import { Input } from "~/components/ui/input";
import { ImportResourceWizard } from "~/components/import-resource-wizard";
import { ResourceDetailsDrawer } from "~/components/resource-details-drawer";
import { useCreateResourceWizard } from "~/CreateResourceWizardContext";
import { Button } from "~/components/ui/button";
import { ProjectGroups } from "~/components/project-groups";

export default function _index() {
  const { selectedProject } = useAppContext();

  const { isLoading, resourceTypes } = useContext(ResourceContext);
  const { openWizard: openCreateWizard } = useCreateResourceWizard();

  const [searchQuery, setSearchQuery] = useState("");

  const [isImportWizardOpen, setIsImportWizardOpen] = useState(false);
  const [isImportResourceLoading, setIsImportResourceLoading] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleImportResources = async (newResources: { resourceType: ResourceType, objects: ApiObject[] }) => {
    setIsImportResourceLoading(true);
    for (const obj of newResources.objects) {
      await createResource("demo", newResources.resourceType, obj);
    }
    setIsImportResourceLoading(false);
    setIsImportWizardOpen(false);
  };

  const types = resourceTypes ?? {};
  const importResourceTypes = Object.values(types).filter(r => r.kind?.endsWith("Ref"));

  return (
    <div className="bg-background flex h-screen">
      <div className="flex h-full w-full flex-col overflow-auto bg-slate-50 pb-12 pl-32 pr-32 pt-12">
        <ProjectHeader selectedProject={selectedProject} />
        <div className="container mx-auto flex items-center space-x-4 rounded-lg">
          <div className="relative flex-grow">
            <Search className="text-muted-foreground absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform" />
            <Input
              type="text"
              placeholder="Search resource..."
              value={searchQuery}
              onChange={handleSearch}
              className="bg-color-wite h-10 w-full py-2 pl-8 pr-4"
            />
          </div>
          <Button onClick={() => openCreateWizard()}>New Resource...</Button>
          <ImportResourceWizard
            isOpen={isImportWizardOpen}
            handleOnOpenChange={setIsImportWizardOpen}
            handleOnImport={handleImportResources}
            resourceTypes={importResourceTypes}
            isLoading={isImportResourceLoading || isLoading}
          />
          <ResourceDetailsDrawer />
        </div>
        <div className={"container mx-auto mt-12"}>
          {isLoading || !types || Object.keys(types).length === 0 ? (
            <LoadingSkeleton />
          ) : (
            <ProjectGroups resourceTypes={resourceTypes} isLoading={isLoading} />
          )}
        </div>
        
      </div>
    </div>
  );
}

const LoadingSkeleton = () => {
  return [...Array(3)].map((_, index) => (
    <div key={index} className="w-full space-y-4 p-4">
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </div>
  ));
};
