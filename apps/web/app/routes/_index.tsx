/**
 * All projects view
 */
import { Search } from "lucide-react";
import { Input } from "~/components/ui/input";
import { useAppContext } from "~/AppContext";
import { useCallback, useState } from "react";
import { CreateResourceWizard } from "~/components/create-resource-wizard";
import { useLoaderData, useNavigation } from "@remix-run/react";
import { ProjectHeader } from "~/components/project-header";
import { ProjectGroups } from "~/components/project-groups";
import { getTypes } from "~/services/get-types";
import { ImportGHRepo } from "~/components/import-gh-repo";
import { json } from "@remix-run/node";
import { useSupabase } from "~/hooks/use-supabase.jsx";

export const loader = async () => {
  return json({
    resourceTypes: await getTypes(),
  });
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

  const supabase = useSupabase();

  const signIn = useCallback(async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
    console.log("supabase.auth.signInWithOAuth", { data, error });
  }, [supabase.auth]);

  return (
    <div className="flex h-full w-full flex-col overflow-auto bg-slate-50 pb-12 pl-32 pr-32 pt-12">
      <button onClick={signIn}>Sign In</button>

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
          resources={resourceTypes || []}
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
