import { chooseColor } from "./components-utils";
import { Badge } from "./ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

const namespaceColors = [
  "bg-purple-100 text-purple-800",
  "bg-pink-100 text-pink-800",
  "bg-teal-100 text-teal-800",
  "bg-orange-100 text-orange-800",
  "bg-cyan-100 text-cyan-800",
  "bg-slate-100 text-slate-800",
];

export const NamespaceBadge = ({ namespace }: { namespace: string }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="inline-block min-w-0 cursor-default">
          <Badge
            variant="outline"
            className={`w-full px-1.5 py-0.5 text-xs ${chooseColor(namespace, namespaceColors)}`}
          >
            <span className="truncate">{namespace}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            Namespace: <span className="font-bold">{namespace}</span>
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
