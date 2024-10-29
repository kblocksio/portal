import { parseBlockUri } from "@kblocks/api";
import { Badge } from "./ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { chooseColor } from "./components-utils";

const systemColors = [
  "bg-blue-100 text-blue-800",
  "bg-lime-100 text-lime-800",
  "bg-orange-100 text-orange-800",
  "bg-violet-100 text-violet-800",
  "bg-indigo-100 text-indigo-800",
  "bg-slate-100 text-slate-800",
];

export interface SystemBadgeProps {
  blockUri: string;
  showSystemName?: boolean;
}

export const SystemBadge = ({ blockUri, showSystemName }: SystemBadgeProps) => {
  const block = parseBlockUri(blockUri);

  const acronyms = block.system
    .split("-")
    .map((word) => word.charAt(0).toUpperCase());

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className="flex items-center gap-2">
            {showSystemName && <span>{block.system}</span>}
            <Badge
              variant="outline"
              className={`px-1.5 py-0.5 text-xs ${chooseColor(
                block.system,
                systemColors,
              )}`}
            >
              {acronyms.join("")}
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{block.system}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
