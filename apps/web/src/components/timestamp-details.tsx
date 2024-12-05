import { memo, useMemo } from "react";

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const localLongDateTimeFormat = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
  fractionalSecondDigits: 3,
  hour12: true,
  timeZone: timezone,
});

const utcLongDateTimeFormat = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
  fractionalSecondDigits: 3,
  hour12: true,
  timeZone: "UTC",
});

export const TimestampDetails = memo(function TimestampDetails({
  timestamp,
}: {
  timestamp: Date | number;
}) {
  const localTime = useMemo(() => {
    return localLongDateTimeFormat.format(timestamp);
  }, [timestamp]);

  const utcTime = useMemo(() => {
    return utcLongDateTimeFormat.format(timestamp);
  }, [timestamp]);

  const timestampMs = useMemo(() => {
    return typeof timestamp === "number" ? timestamp : timestamp.getTime();
  }, [timestamp]);

  return (
    <div className="grid grid-cols-[8em_1fr] gap-1 py-1 text-xs">
      <span className="text-muted-foreground font-light">{timezone}</span>
      <span className="text-foreground">{localTime}</span>
      <span className="text-muted-foreground font-light">UTC</span>
      <span className="text-foreground">{utcTime}</span>
      <span className="text-muted-foreground font-light">Timestamp</span>
      <span className="text-foreground">{timestampMs}</span>
    </div>
  );
});
