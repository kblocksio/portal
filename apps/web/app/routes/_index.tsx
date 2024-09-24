/**
 * All projects view
 */
import { Search } from "lucide-react";
import { Input } from "~/components/ui/input";
import { useAppContext } from "~/AppContext";
import { useState } from "react";
import { CreateResourceWizard } from "~/components/create-resource-wizard";
import { useLoaderData, useNavigation } from "@remix-run/react";
import { ProjectHeader } from "~/components/project-header";
import { ProjectGroups } from "~/components/project-groups";
import { ImportGHRepo } from "~/components/import-gh-repo";
import axios from "axios";
import { ImportResourceWizard } from "~/components/import-resource-wizard";

export const loader = async ({ request }: { request: Request }) => {
  const url = new URL(request.url);
  const apiUrl = `${url.protocol}//${url.host}/api/types`;
  const resources = await axios.get(apiUrl);
  return { resourceTypes: resources.data };
};

export default function _index() {
  const { selectedProject } = useAppContext();
  const { resourceTypes } = useLoaderData<typeof loader>();
  const { state } = useNavigation();

  const [searchQuery, setSearchQuery] = useState("");

  const [isCreateWizardOpen, setIsCreateWizardOpen] = useState(false);
  const [isImportWizardOpen, setIsImportWizardOpen] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCreateResource = (resource: any, providedValues: any) => {
    const res = axios.post("/api/resources", {
      resource: resource,
      providedValues: providedValues,
    });
    console.log(res);
    setIsCreateWizardOpen(false);
  };

  const handleImportResource = (resource: any, providedValues: any) => {
    // const res = axios.post("/api/resources", {
    //   resource: resource,
    //   providedValues: providedValues,
    // });
    setIsImportWizardOpen(false);
  };

  return (
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
        <CreateResourceWizard
          isOpen={isCreateWizardOpen}
          handleOnOpenChange={setIsCreateWizardOpen}
          handleOnCreate={handleCreateResource}
          resourceTypes={
            resourceTypes && resourceTypes.length > 0 ? resourceTypes.filter((resource: any) => !resource.kind.endsWith("Ref")) : []
          }
          isLoading={state === "loading"}
        />
        <ImportResourceWizard
          isOpen={isImportWizardOpen}
          handleOnOpenChange={setIsImportWizardOpen}
          handleOnCreate={handleImportResource}
          resourceTypes={
            resourceTypes && resourceTypes.length > 0 ? resourceTypes.filter((resource: any) => resource.kind.includes("Repo")) : []
          }
          isLoading={state === "loading"}
        />
      </div>
      <div className={"container mx-auto mt-12"}>
        <ProjectGroups
          resourceTypes={resourceTypes}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  );
}
