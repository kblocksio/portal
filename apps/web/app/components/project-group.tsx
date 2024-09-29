import { Resource, ResourceType } from "@repo/shared";
import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { useEffect, useMemo, useState } from "react";
import { getIconComponent, getResourceIconColors } from "~/lib/hero-icon";
import { useResources } from "~/hooks/use-resources";
import { ResourceRow } from "./resouce-row";

export interface ProjectGroupProps {
  resourceType: ResourceType;
  isLoading: boolean;
  searchQuery?: string;
}
export const ProjectGroup = ({
  resourceType,
  searchQuery,
  isLoading,
}: ProjectGroupProps) => {
  const typeId = `${resourceType.group}/${resourceType.version}/${resourceType.plural}`;

  const { resources } = useResources();

  const [resourcesForType, setResourcesForType] = useState<Resource[]>([]);

  useEffect(() => {
    if (!resources || !resources.get(typeId)) {
      return
    };
    setResourcesForType(Array.from(resources.get(typeId)?.values() || []));
  }, [resources]);

  const filteredData = useMemo(() => {
    if (!resourcesForType) return null;
    if (!searchQuery) return resourcesForType;
    return resourcesForType.filter((resource: any) =>
      resource.metadata.name.includes(searchQuery),
    );
  }, [resourcesForType, searchQuery]);

  const Icon = getIconComponent({ icon: resourceType.icon });
  const iconColor = getResourceIconColors({
    color: resourceType?.color,
  });

  return !isLoading && (!filteredData || filteredData?.length === 0) ? null : (
    <section className="mb-8">
      <div className="mb-4 flex items-center">
        <Icon className={`${iconColor} mr-2 h-6 w-6`} />
        <h2 className="text-xl font-semibold">{resourceType.plural}</h2>
      </div>
      <div>
        {isLoading && !filteredData && (
          <Card className="flex items-center justify-between p-4">
            <Skeleton className="h-6 w-32" />
            <div className="flex items-center space-x-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-8 w-20 rounded-md" />{" "}
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </Card>
        )}

        {!isLoading &&
          filteredData &&
          filteredData.length > 0 &&
          filteredData.map((item: Resource, index: number) => (
            <ResourceRow
              key={index}
              item={item}
              isFirst={index === 0}
              isLast={index === filteredData.length - 1}
              objType={typeId}
            />
          ))}
      </div>
    </section>
  );
};

