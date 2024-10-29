import { useMemo } from "react";
import { Resource } from "@/resource-context";
import { CalendarIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";

export function LastUpdated({ resource }: { resource: Resource }) {
  const readyCondition = useMemo(
    () =>
      resource.status?.conditions?.find(
        (condition: any) => condition.type === "Ready",
      ),
    [resource],
  );

  const lastUpdated = useMemo(
    () =>
      readyCondition?.lastTransitionTime ?? resource.metadata.creationTimestamp,
    [readyCondition, resource],
  );

  const relativeTime = useMemo(
    () =>
      lastUpdated
        ? formatDistanceToNow(lastUpdated, { addSuffix: true }).replace(
            "about ",
            "",
          )
        : undefined,
    [lastUpdated],
  );

  if (!lastUpdated) return <></>;

  return (
    <div className="text-muted-foreground whitespace-nowrap text-xs">
      <p className="flex items-center">
        <CalendarIcon className="mr-1 h-3 w-3" />
        {relativeTime}
      </p>
    </div>
  );
}
