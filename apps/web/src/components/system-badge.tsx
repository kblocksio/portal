import { Badge } from "./ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { chooseColor } from "./components-utils";
import { memo } from "react";
import type { ExtendedApiObject } from "@kblocks-portal/server";
import { parseBlockUri } from "@kblocks/api";

const clusterColors = [
  "bg-blue-100 text-blue-800",
  "bg-lime-100 text-lime-800",
  "bg-orange-100 text-orange-800",
  "bg-violet-100 text-violet-800",
  "bg-indigo-100 text-indigo-800",
  "bg-slate-100 text-slate-800",
];

export interface SystemBadgeProps {
  object: ExtendedApiObject;
}

export const SystemBadge = memo(function SystemBadge({
  object,
}: SystemBadgeProps) {
  const system = parseBlockUri(object.objUri).system;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="inline-block min-w-0 cursor-default">
          <Badge
            variant="outline"
            className={`w-full px-1.5 py-0.5 text-xs ${chooseColor(
              system,
              clusterColors,
            )}`}
          >
            <span className="truncate">{system}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            Cluster: <span className="font-bold">{system}</span>
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});
