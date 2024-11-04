import { useMemo } from "react";
import { Resource } from "@/resource-context";
import { CalendarIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { TimestampTooltip } from "./timestamp-tooltip";

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

  const timestamp = useMemo(() => {
    return lastUpdated ? new Date(lastUpdated) : undefined;
  }, [lastUpdated]);

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
    timestamp &&
    relativeTime && (
      <TimestampTooltip timestamp={timestamp}>
        <span className="text-muted-foreground inline-flex items-center whitespace-nowrap text-xs">
          <CalendarIcon className="mr-1 h-3 w-3" />
          {relativeTime}
        </span>
      </TimestampTooltip>
    )
  );
}
