import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { useMemo, useContext, useState } from "react";
import { Resource, ResourceContext, ResourceType } from "~/ResourceContext";
import { getResourceIconColors } from "~/lib/hero-icon";
import { ResourceActionsMenu, StatusBadge, SystemBadge } from "./resource-row";
import Timeline from "./events/timeline";
import { WorkerEvent } from "@kblocks/api";
import { X, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "./ui/button.js";
import { ScrollArea } from "./ui/scroll-area.js";

export const ResourceDetailsDrawer = () => {
  const {
    selectedResourceId,
    setSelectedResourceId,
    resourceTypes,
    resources,
    eventsPerObject,
  } = useContext(ResourceContext);

  const selectedResource = useMemo(() => {
    if (!selectedResourceId) return undefined;
    return resources
      .get(selectedResourceId.objType)
      ?.get(selectedResourceId.objUri);
  }, [selectedResourceId, resources]);

  const selectedResourceType = useMemo(
    () =>
      selectedResource ? resourceTypes[selectedResource.objType] : undefined,
    [resourceTypes, selectedResource],
  );

  const Icon = selectedResourceType?.iconComponent;

  const iconColor = useMemo(
    () => getResourceIconColors({ color: selectedResource?.color }),
    [selectedResource],
  );

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
    <Sheet
      open={!!selectedResource}
      onOpenChange={(x) => (!x ? setSelectedResourceId(undefined) : null)}
    >
      <SheetContent className="w-5/6 xl:w-4/6">
        <SheetHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-4">
            {Icon && <Icon className={`${iconColor} h-8 w-8`} />}
            <div>
              <SheetTitle className="text-2xl font-bold">
                {selectedResource.metadata.name}
              </SheetTitle>
              <SheetDescription className="text-muted-foreground flex gap-4 text-sm">
                {selectedResource?.metadata.namespace}
                <SystemBadge blockUri={selectedResource.objUri} />
              </SheetDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <ResourceActionsMenu
              resource={selectedResource}
              resourceType={selectedResourceType}
            />
            <SheetClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>

        <ScrollArea className="mt-6 h-[calc(100vh-8rem)]">
          <ResourceInfo
            selectedResource={selectedResource}
            selectedResourceType={selectedResourceType}
            eventsPerObject={eventsPerObject}
          />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

function ResourceInfo({
  selectedResource,
  selectedResourceType,
  eventsPerObject,
}: {
  selectedResource: Resource;
  selectedResourceType: ResourceType;
  eventsPerObject: Record<string, Record<string, WorkerEvent>>;
}) {
  const outputs: Record<string, string | undefined> = {
    ...selectedResource.status,
  };

  delete outputs.conditions;
  delete outputs.lastStateHash;

  const outputsEntries = Object.entries(outputs);
  const [outputsExpanded, setOutputsExpanded] = useState(false);

  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-2 text-lg font-semibold">Properties</h3>
        <dl className="grid grid-cols-[minmax(4rem,auto)_1fr] gap-x-4 gap-y-2">
          <dt className="text-muted-foreground flex items-center justify-end whitespace-nowrap text-sm font-medium">
            Type
          </dt>
          <dd className="flex items-center">
            {selectedResourceType?.group}/{selectedResourceType?.version}.
            {selectedResourceType?.kind}
          </dd>
          <dt className="text-muted-foreground flex items-center justify-end whitespace-nowrap text-sm font-medium">
            Status
          </dt>
          <dd className="flex items-center">
            <StatusBadge obj={selectedResource} showMessage={true} />
          </dd>
        </dl>
      </section>
      <section>
        <h3 className="mb-2 text-lg font-semibold">Outputs</h3>
        <dl className="grid grid-cols-[minmax(4rem,auto)_1fr] gap-x-4 gap-y-2">
          {outputsEntries
            .slice(0, outputsExpanded ? undefined : 3)
            .map(([key, value]) => (
              <>
                <dt
                  key={`${key}-key`}
                  className="text-muted-foreground flex items-center justify-end text-sm font-medium"
                >
                  {key}
                </dt>
                <dd key={`${key}-value`} className="flex items-center">
                  {formatValue(value)}
                </dd>
              </>
            ))}
        </dl>
        {outputsEntries.length > 3 && (
          <div className="mt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setOutputsExpanded(!outputsExpanded)}
            >
              {outputsExpanded
                ? "Show Less"
                : `Show More (${outputsEntries.length - 3})`}
              {outputsExpanded ? (
                <ChevronUp className="ml-2 h-4 w-4" />
              ) : (
                <ChevronDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </section>
      <section>
        <h3 className="mb-2 text-lg font-semibold">Events</h3>
        {selectedResource && (
          <Timeline
            events={Object.values(
              eventsPerObject[selectedResource.objUri] ?? [],
            )}
            className="mt-0"
          />
        )}
      </section>
    </div>
  );
}

function formatValue(value: any) {
  if (typeof value === "string") {
    return value;
  }

  if (
    typeof value === "undefined" ||
    (typeof value === "object" && value === null)
  ) {
    return "(n/a)";
  }

  return JSON.stringify(value);
}

function addProperty(
  target: Record<string, string>,
  value: any,
  keyPrefix: string[] = [],
) {
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
