import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { WizardSearchHeader } from "@/components/wizard-search-header";
import { ResourceCatalog } from "@/components/resource-catalog/resource-catalog";
import { useBreadcrumbs } from "@/app-context";
import { trpc } from "@/trpc";
import {
  useResourceTypes,
  type ExtendedResourceType,
} from "@/hooks/use-resource-types";

export const Route = createFileRoute("/resources/new/")({
  component: CreateNewResourceCatalog,
});

function CreateNewResourceCatalog() {
  const { data: resourceTypes } = useResourceTypes();
  const { data: categories } = trpc.listCategories.useQuery(undefined, {
    initialData: {},
  });
  const [searchQuery, setSearchQuery] = useState("");
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  useBreadcrumbs([
    {
      name: "Resources",
      url: "/resources",
    },
    {
      name: "Create a new resource",
    },
  ]);

  const filteredResourceTypes = useMemo(() => {
    return Object.values(resourceTypes).filter((r) => {
      return !r.kind?.endsWith("Ref") && !r.group.startsWith("kblocks.io");
    });
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
    (resourceType: ExtendedResourceType) => {
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
