import { PropsWithChildren } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { TimestampDetails } from "./timestamp-details";

export interface TimestampTooltipProps {
  timestamp: Date;
}

export const TimestampTooltip = (
  props: PropsWithChildren<TimestampTooltipProps>,
) => {
  return (
    <TooltipProvider delayDuration={400}>
      <Tooltip>
        <TooltipTrigger>
          <span className="hover:bg-muted flex items-center rounded-sm px-1 py-0.5 hover:bg-gray-100">
            {props.children}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <TimestampDetails timestamp={props.timestamp} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
