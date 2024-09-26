import { Condition, Resource, ResourceType } from "@repo/shared";
import { Card } from "~/components/ui/card";
import { CalendarIcon } from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";
import { useEffect, useMemo, useState } from "react";
import { getIconComponent, getResourceIconColors } from "~/lib/hero-icon";
import { cn } from "~/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { formatDistanceToNow } from "date-fns";
import { useResources } from "~/hooks/use-resources";
import { useSyncResourcesContext } from "~/hooks/sync-resouces-context";

export interface ProjectGroupProps {
  resourceType: ResourceType;
  searchQuery?: string;
}
export const ProjectGroup = ({
  resourceType,
  searchQuery,
}: ProjectGroupProps) => {
  const typeId = `${resourceType.group}/${resourceType.version}/${resourceType.kind.toLowerCase()}`;
  const { isLoading } = useSyncResourcesContext({
    group: resourceType.group,
    version: resourceType.version,
    plural: resourceType.plural,
  });

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
            <ResourceCard
              key={index}
              item={item}
              isFirst={index === 0}
              isLast={index === filteredData.length - 1}
            />
          ))}
      </div>
    </section>
  );
};

function ResourceCard({
  item,
  isFirst,
  isLast,
}: {
  item: Resource;
  isFirst: boolean;
  isLast: boolean;
}) {
  const borders = [];

  borders.push("rounded-none");
  borders.push("border-none");

  if (isFirst) {
    borders.push("rounded-t-lg");
  }

  if (isLast) {
    borders.push("rounded-b-lg");
  }

  const readyCondition = item?.status?.conditions?.find(
    (condition: any) => condition.type === "Ready",
  );

  return (
    <Card
      className={`flex items-center justify-between p-2 transition-colors duration-200 hover:bg-gray-50 ${borders.join(
        " ",
      )}`}
    >
      <div className="flex items-center space-x-4">
        <StatusBadge readyCondition={readyCondition} message={readyCondition?.message} />
        <div>
          <div className="flex items-center">
            <h3>
              <span className="text-muted-foreground">
                {item.metadata.namespace}
              </span>
              <span className="text-muted-foreground mx-1">·</span>
              <span className="font-semibold">{item.metadata.name}</span>
            </h3>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <LastUpdated lastUpdated={readyCondition?.lastTransitionTime || item.metadata.creationTimestamp} />
      </div>
    </Card>
  );
}

function LastUpdated({ lastUpdated }: { lastUpdated?: string }) {
  if (!lastUpdated) return <></>;

  const relativeTime = formatDistanceToNow(lastUpdated);

  return (
    <div className="text-muted-foreground text-sm">
      <p className="flex items-center">
        <CalendarIcon className="mr-1 h-4 w-4" />
        {relativeTime}
      </p>
    </div>
  );
}

function StatusBadge({ readyCondition, message }: { readyCondition?: Condition, message?: string }) {

  const color = readyCondition
    ? (readyCondition.status === "True"
      ? "green" : (message === "In Progress"
        ? "yellow" : "red")) : "yellow";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div
            className={cn(
              "ml-1",
              "inline-block rounded-full",
              "h-3 w-3",
              `bg-${color}-500`,
              "transition-transform duration-200 hover:scale-125",
            )}
          />
        </TooltipTrigger>
        <TooltipContent>
          <p>{readyCondition?.message ?? "In Progress"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
