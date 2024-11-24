import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ResourceContext, ResourceType } from "@/resource-context";
import { WizardSearchHeader } from "@/components/wizard-search-header";
import { ResourceCatalog } from "@/components/resource-catalog/resource-catalog";
import { useAppContext } from "@/app-context";

export const Route = createFileRoute("/resources/new/")({
  component: CreateNewResourceCatalog,
});

function CreateNewResourceCatalog() {
  const { resourceTypes, categories } = useContext(ResourceContext);
  const { setBreadcrumbs } = useAppContext();
  const [searchQuery, setSearchQuery] = useState("");
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  useEffect(() => {
    setBreadcrumbs([
      {
        name: "Resources",
        url: "/resources",
      },
      {
        name: "Create a new resource",
      },
    ]);
  }, []);

  const filteredResourceTypes = useMemo(() => {
    return Object.values(resourceTypes).filter((r) => !r.kind?.endsWith("Ref"));
  }, [resourceTypes]);

  const filtereResources = useMemo(() => {
    if (!filteredResourceTypes) return [];
    if (!searchQuery) return filteredResourceTypes;
    return filteredResourceTypes.filter((item: any) =>
      item.kind.toLowerCase().includes(searchQuery?.toLowerCase()),
    );
  }, [filteredResourceTypes, searchQuery]);

  const navigate = useNavigate();

  const onResourceSelection = useCallback(
    (resourceType: ResourceType) => {
      navigate({
        to: `/resources/new/${resourceType.group}/${resourceType.version}/${resourceType.plural}`,
      });
    },
    [navigate],
  );

  return (
    <div className="flex flex-col gap-4 py-4 sm:gap-12 sm:py-8">
      <WizardSearchHeader
        title="Create a new resource"
        description="Select the type of resource you want to create"
        searchQuery={searchQuery}
        handleSearch={handleSearch}
      />
      <div className="w-full gap-4">
        <ResourceCatalog
          categories={categories}
          filtereResources={filtereResources}
          onResourceCreateClick={onResourceSelection}
        />
      </div>
    </div>
  );
}
