import { createFileRoute } from "@tanstack/react-router";
import platformMd from "../mock-data/acme.platform.md?raw";
import { MarkdownWrapper } from "@/components/markdown";
import { MyProjects } from "@/components/my-projects";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ResourceContext, ResourceType } from "@/resource-context";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ResourceCatalog } from "@/components/resource-catalog/resource-catalog";
import { useCreateResourceWizard } from "@/create-resource-wizard-context";
import { useAppContext } from "@/app-context";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { resourceTypes, categories } = useContext(ResourceContext);
  const { setBreadcrumbs } = useAppContext();
  const { openWizard } = useCreateResourceWizard();

  const [searchQuery, setSearchQuery] = useState("");
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const filteredResourceTypes = useMemo(() => {
    if (!resourceTypes) return [];
    if (!searchQuery) return Object.values(resourceTypes);
    return Object.values(resourceTypes).filter((item: ResourceType) =>
      item.kind.toLowerCase().includes(searchQuery?.toLowerCase()),
    );
  }, [resourceTypes, searchQuery]);

  const handleResourceSelect = useCallback(
    (resourceType: ResourceType) => {
      openWizard(undefined, resourceType, 2);
    },
    [openWizard],
  );

  useEffect(() => {
    setBreadcrumbs([{ name: "Home", url: "/" }]);
  }, []);

  return (
    <div className="container flex flex-col gap-4 px-4 sm:px-6 lg:px-8">
      {/* organization specific introduction */}
      <MarkdownWrapper content={platformMd} />

      {/* My Projects */}
      <MyProjects />

      {/* Resource Types Catalog */}
      <div className="flex flex-col gap-4 pb-8 pt-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">Resource Catalog</h1>
          <p className="text-muted-foreground text-sm">
            These are the resource types available in the platform.
          </p>
        </div>
        <div className="relative mb-6 flex-grow">
          <Search className="text-muted-foreground absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform" />
          <Input
            type="text"
            placeholder="Search resource..."
            value={searchQuery}
            onChange={handleSearch}
            className="bg-color-wite h-10 w-full py-2 pl-8 pr-4"
          />
        </div>
        <ResourceCatalog
          categories={categories}
          filtereResources={filteredResourceTypes}
          handleResourceSelect={handleResourceSelect}
          isLoading={false}
        />
      </div>
    </div>
  );
}
