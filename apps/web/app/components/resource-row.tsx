import { Card } from "./ui/card";
import { CalendarIcon, MoreVertical, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { cn } from "~/lib/utils";
import { LastLogMessage } from "./last-log-message";
import { useContext, useMemo, useState } from "react";
import { Resource, ResourceContext, ResourceType } from "~/ResourceContext";
import { ApiObject, parseBlockUri, StatusReason } from "@kblocks/api";
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
  "bg-cyan-100 text-cyan-800",
];

export function SystemBadge({
  blockUri,
  // className,
}: {
  blockUri: string;
  // className?: string;
}) {
  // const block = parseBlockUri(blockUri);
  // return (
  //   <TooltipProvider>
  //     <Tooltip>
  //       <TooltipTrigger
  //         tabIndex={-1}
  //         className="cursor-default focus:outline-none"
  //       >
  //         <Badge
  //           variant="outline"
  //           className={`px-1.5 py-0.5 text-xs ${getSystemIdColor(block.system)} ${className}`}
  //           tabIndex={-1}
  //           aria-hidden="true"
  //         >
  //           {block.system}
  //         </Badge>
  //       </TooltipTrigger>
  //       <TooltipContent>
  //         <p>System</p>
  //       </TooltipContent>
  //     </Tooltip>
  //   </TooltipProvider>
  // );
  const block = parseBlockUri(blockUri);

  const acronyms = block.system
    .split("-")
    .map((word) => word.charAt(0).toUpperCase());

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge
            variant="outline"
            className={`px-1.5 py-0.5 text-xs ${chooseColor(block.system, systemColors)}`}
          >
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

export function NamespaceBadge({ namespace }: { namespace: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge
            variant="outline"
            className={`px-1.5 py-0.5 text-xs ${chooseColor(namespace, namespaceColors)}`}
          >
            {namespace}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{namespace} Namespace</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function chooseColor(key: string, palette: string[]): string {
  const index =
    key.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    palette.length;
  return palette[index];
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

export function StatusBadge({
  obj,
  showMessage,
}: {
  obj?: ApiObject;
  showMessage?: boolean;
}) {
  const readyCondition = obj?.status?.conditions?.find(
    (c) => c.type === "Ready",
  );
  const reason = readyCondition?.reason as StatusReason;

  const getStatusContent = (reason: StatusReason) => {
    switch (reason) {
      case StatusReason.Completed:
        return <div className="h-3 w-3 rounded-full bg-green-500" />;
      case StatusReason.ResolvingReferences:
      case StatusReason.InProgress:
        return <Loader2 className="h-3 w-3 animate-spin text-yellow-500" />;
      case StatusReason.Error:
        return <div className="h-3 w-3 rounded-full bg-red-500" />;
      default:
        console.log("unknown reason", readyCondition);
        return <div className="h-3 w-3 rounded-full bg-gray-500" />;
    }
  };

  const statusContent = getStatusContent(reason);

  const wrapper = (
    <div className="ml-1 inline-block transition-transform duration-200 hover:scale-125">
      {statusContent}
    </div>
  );

  return readyCondition?.message ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          {wrapper}
          {showMessage && (
            <span className="ml-2">{readyCondition?.message}</span>
          )}
        </TooltipTrigger>
        <TooltipContent>
          <p>{readyCondition?.message ?? "In Progress"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    wrapper
  );
}

export function ResourceActionsMenu({
  resource,
  resourceType,
}: {
  resource: Resource;
  resourceType: ResourceType;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { openWizard: openEditWizard } = useCreateResourceWizard();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger
        className="focus:outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <MoreVertical className="h-5 w-5 text-gray-500 hover:text-gray-700" />
      </DropdownMenuTrigger>
      <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem
          onSelect={() => {
            openEditWizard({ resource, resourceType });
            closeMenu();
          }}
        >
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive"
          onSelect={(e) => {
            e.preventDefault();
            setIsDeleteOpen(true);
          }}
        >
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
