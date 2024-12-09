import { ResourceCatalog } from "@/components/resource-catalog/resource-catalog";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCallback, useMemo, useState } from "react";
import { useBreadcrumbs } from "@/app-context";
import { getIconComponent } from "@/lib/get-icon";
import { RoutePageHeader } from "@/components/route-page-header";
import { trpc } from "@/trpc";
import type { ResourceType } from "@kblocks-portal/server";
import { useResourceTypes } from "@/hooks/use-resource-types";

export const Route = createFileRoute("/catalog/")({
  component: Catalog,
});

function Catalog() {
  const resourceTypes = useResourceTypes();

  const categories = trpc.listCategories.useQuery(undefined, {
    initialData: {},
  });

  const navigate = useNavigate();

  const Icon = getIconComponent({ icon: "heroicon://magnifying-glass" });

  const [searchQuery, setSearchQuery] = useState("");

  useBreadcrumbs(() => {
    return [{ name: "Catalog" }];
  }, []);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleOnResourceCreateClick = useCallback(
    (resourceType: ResourceType) => {
      navigate({
        to: `/resources/new/${resourceType.group}/${resourceType.version}/${resourceType.plural}`,
      });
    },
    [navigate],
  );

  const handleOnCardClick = useCallback(
    (resourceType: ResourceType) => {
      navigate({
        to: `/catalog/${resourceType.group}/${resourceType.version}/${resourceType.plural}`,
      });
    },
    [navigate],
  );

  const nonSystemResourceTypes = useMemo(() => {
    return Object.values(resourceTypes.data).filter(
      (item) => !item.group.startsWith("kblocks.io"),
    );
  }, [resourceTypes.data]);

  const filteredResourceTypes = useMemo(() => {
    if (!nonSystemResourceTypes) return [];
    if (!searchQuery) return Object.values(nonSystemResourceTypes);
    return Object.values(nonSystemResourceTypes).filter((item) =>
      item.kind.toLowerCase().includes(searchQuery?.toLowerCase()),
    );
  }, [nonSystemResourceTypes, searchQuery]);

  return (
    <div className="container mx-auto flex flex-col gap-4">
      <div className="flex flex-col gap-4 pb-8 pt-8">
        <RoutePageHeader
          title="Catalog"
          description="These are the resource types available in the platform."
          Icon={Icon}
        />
        <div className="relative mb-6 flex-grow">
          <Search className="text-muted-foreground absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform" />
          <Input
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            tabIndex={0}
            type="text"
            placeholder="Search resource..."
            value={searchQuery}
            onChange={handleSearch}
            className="bg-color-wite h-10 w-full py-2 pl-8 pr-4"
          />
        </div>
        <ResourceCatalog
          categories={categories.data}
          filtereResources={filteredResourceTypes}
          onResourceCreateClick={handleOnResourceCreateClick}
          isLoading={!searchQuery && Object.keys(resourceTypes).length === 0}
          onCardClick={handleOnCardClick}
        />
      </div>
    </div>
  );
}
