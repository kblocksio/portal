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

export const Timestamp = (props: { timestamp: Date }) => {
  const timestamp = useMemo(() => {
    return shortDateTimeFormat.format(props.timestamp);
  }, [props.timestamp]);

  return (
    <TimestampTooltip timestamp={props.timestamp}>
      <span className="text-foreground rounded-sm px-1 py-0.5 font-mono text-xs uppercase hover:bg-gray-100">
        {timestamp}
      </span>
    </TimestampTooltip>
  );
};
