import { Sheet, SheetContent, SheetHeader, SheetTitle } from "~/components/ui/sheet"
import { useMemo, useContext } from "react";
import { Resource, ResourceContext, ResourceType } from "~/ResourceContext";
import { getResourceIconColors } from "~/lib/hero-icon";
import { ResourceActionsMenu, StatusBadge, SystemBadge } from "./resource-row";
import Timeline from "./events/timeline";
import { Table, TableBody, TableCell, TableRow } from "./ui/table";
import { WorkerEvent } from "@kblocks/api";

export const ResourceDetailsDrawer = () => {
  const { selectedResourceId, setSelectedResourceId, resourceTypes, resources, eventsPerObject } = useContext(ResourceContext);

  const selectedResource = useMemo(() => {
    if (!selectedResourceId) return undefined;
    return resources.get(selectedResourceId.objType)?.get(selectedResourceId.objUri);
  }, [selectedResourceId, resources]);

  const selectedResourceType = useMemo(() => (selectedResource ? resourceTypes[selectedResource.objType] : undefined),
    [resourceTypes, selectedResource]);

  const Icon = selectedResourceType?.iconComponent;

  const iconColor = useMemo(() => (
    getResourceIconColors({ color: selectedResource?.color })
  ), [selectedResource]);

  const properties: Record<string, string> = {};
  const outputs: Record<string, string> = {};

  addProperty(properties, {
    ...selectedResource,
    status: undefined,
    metadata: undefined,
    apiVersion: undefined,
    kind: undefined,
    objType: undefined,
    objUri: undefined,
  });

  addProperty(outputs, {
    ...selectedResource?.status,
    conditions: undefined,
  });

  if (!selectedResource || !selectedResourceType) {
    return null;
  }

  return (
    <Sheet open={!!selectedResource} onOpenChange={(x) => (!x ? setSelectedResourceId(undefined) : null)}>
      <SheetContent className="min-w-[700px] flex flex-col h-full gap-0 pb-0">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold flex items-center gap-2 ml-1 mb-0 border-b border-b-muted-foreground/10 pb-2">
            {Icon && <Icon className={`${iconColor} h-7 w-7`} />}
            <span className="text-muted-foreground whitespace-nowrap">{selectedResource?.metadata.namespace}</span>
            <span className="text-muted-foreground mx-1">·</span>
            {selectedResource.metadata.name}

            <SystemBadge
              blockUri={selectedResource.objUri}
              className="mb-2 ml-6"
            />

            <div className="flex-grow"></div>
            <ResourceActionsMenu resource={selectedResource} resourceType={selectedResourceType} />
          </SheetTitle>

        </SheetHeader>

        <ResourceInfo selectedResource={selectedResource} selectedResourceType={selectedResourceType} eventsPerObject={eventsPerObject} />
      </SheetContent>
    </Sheet>
  );
}

function ResourceInfo({ selectedResource, selectedResourceType, eventsPerObject }: { selectedResource: Resource, selectedResourceType: ResourceType, eventsPerObject: Record<string, Record<string, WorkerEvent>> }) {
  const outputs: Record<string, string | undefined> = {
    ...selectedResource.status,
  };

  delete outputs.conditions;
  delete outputs.lastStateHash;

  return (
    <div className="mt-4 space-y-4 flex flex-col overflow-hidden">
      <div>
        <h1 className="text-lg">Type</h1>
        <p className="mt-1">
          {selectedResourceType?.group}/{selectedResourceType?.version}.{selectedResourceType?.kind}
        </p>
      </div>

      <div>
        <h1 className="text-lg">Status</h1>
        <div className="mt-1 flex items-center">
          <StatusBadge obj={selectedResource} showMessage={true} />

        </div>
      </div>

      {Object.keys(outputs).length > 0 && (
        <div>
          <h1 className="text-lg">Outputs</h1>
          <PropertiesTable properties={outputs} />
        </div>
      )}

      <h1 className="text-lg">Events</h1>
      <div className="w-full h-px bg-gray-200"></div>
      {selectedResource && <Timeline events={Object.values(eventsPerObject[selectedResource.objUri] ?? [])} className="mt-0" />}
    </div>
  );
}

function PropertiesTable({ properties }: { properties: Record<string, any> }) {
  return (
    <Table>
      <TableBody>
        {Object.entries(properties).map(([key, value]) => (
          <TableRow key={key}>
            <TableCell>
              <span className="font-extrabold">{key}</span>
            </TableCell>
            <TableCell>{formatValue(value)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function formatValue(value: any) {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "undefined" || (typeof value === "object" && value === null)) {
    return "(n/a)";
  }

  return JSON.stringify(value);
}

function addProperty(target: Record<string, string>, value: any, keyPrefix: string[] = []) {
  if (value === undefined) {
    return;
  }
  if (Array.isArray(value)) {
    target[keyPrefix.join(".")] = value.join(", ");
  } else if (typeof value === "object" && value !== null) {
    for (const [k, v] of Object.entries(value)) {
      addProperty(target, v, [...keyPrefix, k]);
    }
  } else {
    target[keyPrefix.join(".")] = value;
  }
}
