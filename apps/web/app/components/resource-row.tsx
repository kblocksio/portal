import { Card } from "./ui/card";
import { CalendarIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { cn } from "~/lib/utils";
import { LastLogMessage } from "./last-log-message";
import { useContext } from "react";
import { Resource, ResourceContext } from "~/ResourceContext";
import { ApiObject } from "@kblocks/cli/types";

export const ResourceRow = ({
  item,
  isFirst,
  isLast,
}: {
  item: ApiObject;
  isFirst: boolean;
  isLast: boolean;
}) => {
  const { setSelectedResourceId } = useContext(ResourceContext);
  const borders = [];

  borders.push("rounded-none");
  borders.push("border-none");

  if (isFirst) {
    borders.push("rounded-t-lg");
  }

  if (isLast) {
    borders.push("rounded-b-lg");
  }

  const readyCondition = item?.status?.conditions?.find(
    (condition: any) => condition.type === "Ready",
  );

  return (
    <Card
      className={`flex items-center justify-between p-2 cursor-pointer transition-colors duration-200 hover:bg-gray-50 ${borders.join(
        " ",
      )}`}
      onClick={() => setSelectedResourceId({ objType: item.objType, objUri: item.objUri })}
    >
      {/* Left Section: Status Badge, Namespace, Name */}
      <div className="flex items-center space-x-4 flex-shrink-0">
        <StatusBadge readyCondition={readyCondition} message={readyCondition?.message} />
        <div className="flex-shrink-0">
          <div className="flex items-center">
            <h3 className="flex-shrink-0">
              <span className="text-muted-foreground whitespace-nowrap">
                {item.metadata.namespace}
              </span>
              <span className="text-muted-foreground mx-1">·</span>
              <span className="font-semibold whitespace-nowrap">{item.metadata.name}</span>
            </h3>
          </div>
        </div>
      </div>

      {/* Middle Section: Log Message & Timestamp */}
      <div className="flex px-6 items-center space-x-4 flex-grow min-w-0">
        <LastLogMessage objUri={item.objUri} />
      </div>

      {/* Right Section: Last Updated */}
      <div className="flex items-center space-x-4 flex-shrink-0">
        <LastUpdated lastUpdated={readyCondition?.lastTransitionTime || item.metadata.creationTimestamp} />
      </div>
    </Card>
  );
}

function LastUpdated({ lastUpdated }: { lastUpdated?: string }) {
  if (!lastUpdated) return <></>;

  const relativeTime = formatDistanceToNow(lastUpdated);

  return (
    <div className="text-muted-foreground text-sm">
      <p className="flex items-center">
        <CalendarIcon className="mr-1 h-4 w-4" />
        {relativeTime}
      </p>
    </div>
  );
}

export function StatusBadge({ readyCondition, message }: { readyCondition?: any, message?: string }) {

  const color = readyCondition
    ? (readyCondition.status === "True"
      ? "green" : (message === "In Progress"
        ? "yellow" : "red")) : "yellow";

  const div = <div
    className={cn(
      "ml-1",
      "inline-block rounded-full",
      "h-3 w-3",
      `bg-${color}-500`,
      "transition-transform duration-200 hover:scale-125",
    )}
  />;

  return message ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          {div}
        </TooltipTrigger>
        <TooltipContent>
          <p>{readyCondition?.message ?? "In Progress"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : div;
}
