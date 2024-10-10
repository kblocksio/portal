import { Card } from "./ui/card";
import { CalendarIcon, MoreVertical, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { cn } from "~/lib/utils";
import { LastLogMessage } from "./last-log-message";
import { useContext, useMemo, useState } from "react";
import { Resource, ResourceContext, ResourceType } from "~/ResourceContext";
import { ApiObject, Condition, parseBlockUri, StatusReason } from "@kblocks/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { DeleteResourceDialog } from "./delete-resource"; // Add this import
import { useCreateResourceWizard } from "~/CreateResourceWizardContext";
import { Badge } from "./ui/badge"; // Add this import

export const ResourceRow = ({
  item,
  isFirst,
  isLast,
}: {
  item: ApiObject;
  isFirst: boolean;
  isLast: boolean;
}) => {
  const { setSelectedResourceId, resources, resourceTypes } = useContext(ResourceContext);

  const selectedResource = useMemo(() => {
    return resources.get(item.objType)?.get(item.objUri);
  }, [resources, item.objType, item.objUri]);

  const selectedResourceType = useMemo(() => (
    resourceTypes[item.objType]
  ), [resourceTypes, item.objType]);

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
      className={cn("flex items-center justify-between p-4 cursor-pointer transition-colors duration-200 hover:bg-gray-50", borders.join(" "))}
      onClick={() => setSelectedResourceId({ objType: item.objType, objUri: item.objUri })}
    >

      <div className="flex w-full justify-between items-center">
        {/* Left Section: Status Badge, Namespace, Name, and LastUpdated */}

        <div className="flex items-center space-x-4 flex-shrink-0">
          <StatusBadge readyCondition={readyCondition} message={readyCondition?.message} />

          <div className="flex-shrink-0">
            <div className="flex items-center space-x-2">
              <h3>
                <span className="text-muted-foreground whitespace-nowrap">
                  {item.metadata.namespace}
                </span>
                <span className="text-muted-foreground mx-1">·</span>
                <span className="font-semibold whitespace-nowrap">{item.metadata.name}</span>
              </h3>
              <SystemBadge blockUri={item.objUri} />
            </div>
          </div>

        </div>


        {/* Middle Section: Log Message & Timestamp */}
        <div className="flex-grow min-w-0 px-6">
          <LastLogMessage objUri={item.objUri} />
        </div>

        {/* Right Section: System ID Badge and Ellipsis Menu */}
        <div className="flex items-center space-x-4 flex-shrink-0">
          &nbsp;
          <LastUpdated lastUpdated={readyCondition?.lastTransitionTime || item.metadata.creationTimestamp} />
          {selectedResource && selectedResourceType
            && <ActionsMenu resource={selectedResource} resourceType={selectedResourceType} />}
        </div>
      </div>

    </Card>
  );
}

export function SystemBadge({ blockUri, className }: { blockUri: string, className?: string }) {
  const block = parseBlockUri(blockUri);
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge variant="outline" className={`text-xs px-1.5 py-0.5 ${getSystemIdColor(block.system)} ${className}`} tabIndex={-1}>
            {block.system}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>System</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

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

export function StatusBadge({ readyCondition, message }: { readyCondition?: Condition, message?: string }) {
  const reason = readyCondition?.reason as StatusReason;
  
  const getStatusContent = (reason: StatusReason) => {
    switch (reason) {
      case StatusReason.Completed:
        return <div className="bg-green-500 h-3 w-3 rounded-full" />;
      case StatusReason.ResolvingReferences:
      case StatusReason.InProgress:
        return <Loader2 className="h-3 w-3 text-yellow-500 animate-spin" />;
      case StatusReason.Error:
        return <div className="bg-red-500 h-3 w-3 rounded-full" />;
      default:
        console.log("unknown reason", readyCondition);
        return <div className="bg-gray-500 h-3 w-3 rounded-full" />;
    }
  }

  const statusContent = getStatusContent(reason);

  const wrapper = (
    <div className="ml-1 inline-block transition-transform duration-200 hover:scale-125">
      {statusContent}
    </div>
  );

  return message ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          {wrapper}
        </TooltipTrigger>
        <TooltipContent>
          <p>{readyCondition?.message ?? "In Progress"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : wrapper;
}

function ActionsMenu({ resource, resourceType }: { resource: Resource, resourceType: ResourceType }) {
  const [isOpen, setIsOpen] = useState(false);
  const { openWizard: openEditWizard } = useCreateResourceWizard();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger className="focus:outline-none" onClick={(e) => e.stopPropagation()}>
        <MoreVertical className="h-5 w-5 text-gray-500 hover:text-gray-700" />
      </DropdownMenuTrigger>
      <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onSelect={() => {
          openEditWizard({ resource, resourceType });
          closeMenu();
        }}>
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive" onSelect={(e) => {
          e.preventDefault();
          setIsDeleteOpen(true);
        }}>
          Delete...
        </DropdownMenuItem>
        <DeleteResourceDialog
          resource={resource}
          isOpen={isDeleteOpen}
          onClose={() => {
            setIsDeleteOpen(false);
            closeMenu();
          }}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getSystemIdColor(systemId: string): string {
  const colors = [
    "bg-red-100 text-red-800",
    "bg-blue-100 text-blue-800",
    "bg-green-100 text-green-800",
    "bg-yellow-100 text-yellow-800",
    "bg-purple-100 text-purple-800",
    "bg-pink-100 text-pink-800",
    "bg-indigo-100 text-indigo-800",
  ];

  const index = systemId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
}
