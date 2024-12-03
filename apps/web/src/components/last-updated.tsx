import { useMemo } from "react";
import { CalendarIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { TimestampTooltip } from "./timestamp-tooltip";

export function LastUpdated({ timestamp }: { timestamp: number }) {
  const relativeTime = useMemo(
    () =>
      timestamp
        ? formatDistanceToNow(timestamp, { addSuffix: true }).replace(
            "about ",
            "",
          )
        : undefined,
    [timestamp],
  );

  if (!timestamp) return <></>;

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
