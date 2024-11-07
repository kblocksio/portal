import { useMemo } from "react";
import { TimestampTooltip } from "./timestamp-tooltip";

const shortDateTimeFormat = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  fractionalSecondDigits: 2,
  hour12: false,
});

export const Timestamp = (props: { timestamp: Date | number }) => {
  const timestamp = useMemo(() => {
    return props.timestamp instanceof Date
      ? props.timestamp
      : new Date(props.timestamp);
  }, [props.timestamp]);

  const formatted = useMemo(() => {
    return shortDateTimeFormat.format(timestamp);
  }, [timestamp]);

  const isoString = useMemo(() => {
    return timestamp.toISOString();
  }, [timestamp]);

  return (
    <TimestampTooltip timestamp={timestamp}>
      <time
        dateTime={isoString}
        className="whitespace-nowrap px-1 py-0.5 font-mono text-xs uppercase leading-none"
        role="time"
      >
        {formatted}
      </time>
    </TimestampTooltip>
  );
};
