import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Badge } from "./ui/badge";
import { parseBlockUri } from "@kblocks/api";
import { cn } from "~/lib/utils";
import { Resource } from "~/ResourceContext";

export function NamespaceBadge({ namespace }: { namespace: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge variant="outline" className={`text-xs px-1.5 py-0.5 ${chooseColor(namespace, namespaceColors)}`}>{namespace}</Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{namespace} Namespace</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function SystemBadge({ blockUri }: { blockUri: string }) {
  const block = parseBlockUri(blockUri);

  const acronyms = block.system.split("-").map(word => word.charAt(0).toUpperCase());

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge variant="outline" className={`text-xs px-1.5 py-0.5 ${chooseColor(block.system, systemColors)}`}>
            {acronyms.join("")}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{block.system}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function StatusBadge({ obj, className }: { obj: Resource, className?: string }) {
  const readyCondition = obj?.status?.conditions?.find(
    (condition: any) => condition.type === "Ready",
  );

  const color = readyCondition
    ? (readyCondition.status === "True"
      ? "green" : (readyCondition.message === "In Progress"
        ? "yellow" : "red")) : "yellow";

  return <div
    className={cn(
      "ml-1",
      "inline-block rounded-full",
      "h-3 w-3",
      `bg-${color}-500`,
      className,
      "transition-transform duration-200 hover:scale-125",
    )}
  />;
}


const systemColors = [
  "bg-blue-100 text-blue-800",
  "bg-green-100 text-green-800",
  "bg-yellow-100 text-yellow-800",
  "bg-red-100 text-red-800",
  "bg-indigo-100 text-indigo-800",
];

const namespaceColors = [
  "bg-purple-100 text-purple-800",
  "bg-pink-100 text-pink-800",
  "bg-teal-100 text-teal-800",
  "bg-orange-100 text-orange-800",
  "bg-cyan-100 text-cyan-800"
];

function chooseColor(key: string, palette: string[]): string {
  const index = key.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % palette.length;
  return palette[index];
}
