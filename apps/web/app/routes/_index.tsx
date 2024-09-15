/**
 * All projects view
 */
import { Search } from "lucide-react";
import { Input } from "~/components/ui/input";
import { useAppContext } from "~/AppContext";
import { useState } from "react";
import { CreateResourceWizard } from "~/components/create-resource-wizard";
import axios from "axios";
import { useLoaderData, useNavigation } from "@remix-run/react";
import { ProjectHeader } from "~/components/project-header";
import { ProjectGroups } from "~/components/project-groups";
import { ResourceType } from "@repo/shared";

export const loader = async () => {
  return {
    resourceTypes: (await axios.get(`/api/types`)).data as ResourceType[],
  };
};

export default function Index() {
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
    <div className="flex flex-col w-full h-full bg-slate-50 pl-32 pr-32 pt-12 pb-12 overflow-auto">
      <ProjectHeader selectedProject={selectedProject} />
      <div className="container mx-auto flex items-center space-x-4 rounded-lg">
        <div className="relative flex-grow">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search resource..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-8 pr-4 py-2 h-10 w-full bg-color-wite"
          />
        </div>
        <CreateResourceWizard
          isOpen={isOpen}
          handleOnOpenChange={setIsOpen}
          handleOnCreate={handleCreateResource}
          resources={resourceTypes || []}
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
