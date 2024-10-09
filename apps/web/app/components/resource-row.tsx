import { Card } from "./ui/card";
import { CalendarIcon, MoreVertical } from "lucide-react";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { cn } from "~/lib/utils";
import { LastLogMessage } from "./last-log-message";
import { useContext, useMemo, useState } from "react";
import { Resource, ResourceContext } from "~/ResourceContext";
import { ApiObject } from "@kblocks/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { DeleteResourceDialog } from "./delete-resource"; // Add this import
import { useCreateResourceWizard } from "~/CreateResourceWizardContext";
import { ResourceType } from "@repo/shared";
import { StatusBadge, SystemBadge } from "./badges";

export const ResourceRow = ({
  item,
  isFirst,
  isLast,
}: {
  item: Resource;
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

  return (
    <Card
      className={cn("flex items-center justify-between p-4 cursor-pointer transition-colors duration-200 hover:bg-gray-50", borders.join(" "))}
      onClick={() => setSelectedResourceId({ objType: item.objType, objUri: item.objUri })}
    >

      <div className="flex w-full justify-between items-center">
        {/* Left Section: Status Badge, Namespace, Name, and LastUpdated */}

        <div className="flex items-center space-x-4 flex-shrink-0">
          <StatusBadge obj={item} />

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
          <LastUpdated obj={item} />
          {selectedResource && selectedResourceType
            && <ActionsMenu resource={selectedResource} resourceType={selectedResourceType} />}
        </div>
      </div>

    </Card>
  );
}

export function LastUpdated({ obj }: { obj: ApiObject }) {
  const readyCondition = obj?.status?.conditions?.find(
    (condition: any) => condition.type === "Ready",
  );

  const lastUpdated = readyCondition?.lastTransitionTime ?? obj.metadata.creationTimestamp

  if (!lastUpdated) return <></>;

  const relativeTime = formatDistanceToNow(lastUpdated);

  return (
    <div className="text-muted-foreground">
      <p className="flex items-center">
        <CalendarIcon className="mr-1 h-3 w-3" />
        {relativeTime}
      </p>
    </div>
  );
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
