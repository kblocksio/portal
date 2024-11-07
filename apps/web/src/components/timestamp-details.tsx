import { useMemo } from "react";

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

export const TimestampDetails = (props: { timestamp: Date }) => {
  const localTime = useMemo(() => {
    return localLongDateTimeFormat.format(props.timestamp);
  }, [props.timestamp]);

  const utcTime = useMemo(() => {
    return utcLongDateTimeFormat.format(props.timestamp);
  }, [props.timestamp]);

  const timestamp = useMemo(() => {
    return props.timestamp.getTime();
  }, [props.timestamp]);

  return (
    <div className="grid grid-cols-[8em_1fr] gap-1 py-1 text-xs">
      <span className="text-muted-foreground font-light">{timezone}</span>
      <span className="text-foreground">{localTime}</span>
      <span className="text-muted-foreground font-light">UTC</span>
      <span className="text-foreground">{utcTime}</span>
      <span className="text-muted-foreground font-light">Timestamp</span>
      <span className="text-foreground">{timestamp}</span>
    </div>
  );
};
