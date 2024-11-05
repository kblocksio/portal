import { ResourceCatalog } from "@/components/resource-catalog/resource-catalog";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ResourceContext, ResourceType } from "@/resource-context";
import { useCreateResourceWizard } from "@/create-resource-wizard-context";
import { useAppContext } from "@/app-context";

export const Route = createFileRoute("/catalog/")({
  component: Catalog,
});

function Catalog() {
  const { resourceTypes, categories } = useContext(ResourceContext);
  const { setBreadcrumbs } = useAppContext();
  const { openWizard } = useCreateResourceWizard();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setBreadcrumbs([{ name: "Catalog" }]);
  }, [setBreadcrumbs]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleOnResourceCreateClick = useCallback(
    (resourceType: ResourceType) => {
      openWizard(undefined, resourceType, 2);
    },
    [openWizard],
  );

  const handleOnCardClick = useCallback(
    (resourceType: ResourceType) => {
      navigate({
        to: `/catalog/${resourceType.group}/${resourceType.version}/${resourceType.plural}`,
      });
    },
    [navigate],
  );
  const filteredResourceTypes = useMemo(() => {
    if (!resourceTypes) return [];
    if (!searchQuery) return Object.values(resourceTypes);
    return Object.values(resourceTypes).filter((item: ResourceType) =>
      item.kind.toLowerCase().includes(searchQuery?.toLowerCase()),
    );
  }, [resourceTypes, searchQuery]);

  return (
    <div className="container mx-auto flex flex-col gap-4">
      <div className="flex flex-col gap-4 pb-8 pt-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Resource Catalog
          </h1>
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
          onResourceCreateClick={handleOnResourceCreateClick}
          isLoading={false}
          onCardClick={handleOnCardClick}
        />
      </div>
    </div>
  );
}
