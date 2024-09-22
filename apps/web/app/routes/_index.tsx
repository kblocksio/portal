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

  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCreateResource = (resource: any) => {
    setIsOpen(false);
    console.log("Creating resource", resource);
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
          isOpen={isOpen}
          handleOnOpenChange={setIsOpen}
          handleOnCreate={handleCreateResource}
          resources={
            resourceTypes && resourceTypes.length > 0 ? resourceTypes : []
          }
          isLoading={state === "loading"}
        />
        <ImportGHRepo />
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
