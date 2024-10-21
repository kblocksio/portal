import { Card } from "./ui/card";
import { CalendarIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { cn } from "~/lib/utils";
import { LastLogMessage } from "./last-log-message";
import { useContext, useMemo } from "react";
import { Resource, ResourceContext } from "~/ResourceContext";
import { ApiObject } from "@kblocks/api";
import { StatusBadge } from "./status-badge";
import { SystemBadge } from "./system-badge";
import { ResourceActionsMenu } from "./resource-actions-menu";

export const ResourceRow = ({
  item,
  isFirst,
  isLast,
}: {
  item: ApiObject;
  isFirst: boolean;
  isLast: boolean;
}) => {
  const { setSelectedResourceId, resources, resourceTypes } =
    useContext(ResourceContext);

  const selectedResource = useMemo(() => {
    return resources.get(item.objType)?.get(item.objUri);
  }, [resources, item.objType, item.objUri]);

  const selectedResourceType = useMemo(
    () => resourceTypes[item.objType],
    [resourceTypes, item.objType],
  );

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
      className={cn(
        "flex cursor-pointer items-center justify-between p-4 transition-colors duration-200 hover:bg-gray-50",
        borders.join(" "),
      )}
      onClick={() =>
        setSelectedResourceId({ objType: item.objType, objUri: item.objUri })
      }
    >
      <div className="flex w-full items-center justify-between">
        {/* Left Section: Status Badge, Namespace, Name, and LastUpdated */}

        <div className="flex flex-shrink-0 items-center space-x-4">
          <StatusBadge obj={selectedResource} />

          <div className="flex-shrink-0">
            <div className="flex items-center space-x-2">
              <h3>
                <span className="text-muted-foreground whitespace-nowrap">
                  {item.metadata.namespace}
                </span>
                <span className="text-muted-foreground mx-1">·</span>
                <span className="whitespace-nowrap font-semibold">
                  {item.metadata.name}
                </span>
              </h3>
              <SystemBadge blockUri={item.objUri} />
            </div>
          </div>
        </div>

        {/* Middle Section: Log Message & Timestamp */}
        <div className="min-w-0 flex-grow px-6">
          <LastLogMessage objUri={item.objUri} />
        </div>

        {/* Right Section: System ID Badge and Ellipsis Menu */}
        <div className="flex flex-shrink-0 items-center space-x-4">
          &nbsp;
          <LastUpdated
            lastUpdated={
              readyCondition?.lastTransitionTime ||
              item.metadata.creationTimestamp
            }
          />
          {selectedResource && selectedResourceType && (
            <ResourceActionsMenu
              resource={selectedResource}
              resourceType={selectedResourceType}
            />
          )}
        </div>
      </div>
    </Card>
  );
};

function LastUpdated({ lastUpdated }: { lastUpdated?: string }) {
  if (!lastUpdated) return <></>;

  const relativeTime = formatDistanceToNow(lastUpdated, { addSuffix: true });

  return (
    <div className="text-muted-foreground text-xs">
      <p className="flex items-center">
        <CalendarIcon className="mr-1 h-3 w-3" />
        Updated {relativeTime}
      </p>
    </div>
  );
}
