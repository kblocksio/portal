import { memo, PropsWithChildren } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { TimestampDetails } from "./timestamp-details";

export interface TimestampTooltipProps {
  timestamp: Date | number;
}

export const TimestampTooltip = memo(function TimestampTooltip({
  timestamp,
  children,
}: PropsWithChildren<TimestampTooltipProps>) {
  return (
    <TooltipProvider delayDuration={400}>
      <Tooltip>
        <TooltipTrigger>
          <span className="hover:bg-muted flex items-center rounded-sm px-1 py-0.5 hover:bg-gray-100">
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <TimestampDetails timestamp={timestamp} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});
