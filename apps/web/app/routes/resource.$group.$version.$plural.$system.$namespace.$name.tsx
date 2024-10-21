import { useParams } from "@remix-run/react";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import Timeline from "~/components/events/timeline";
import { Button } from "~/components/ui/button";
import {
  ResourceContext,
  type Resource,
  type ResourceType,
} from "~/ResourceContext";
import { WorkerEvent } from "@kblocks/api";
import { Fragment, useContext, useEffect, useMemo, useState } from "react";
import { StatusBadge } from "~/components/status-badge";
import { ScrollArea } from "~/components/ui/scroll-area";
import { SystemBadge } from "~/components/system-badge";
import { ResourceActionsMenu } from "~/components/resource-actions-menu";
import { getResourceIconColors } from "~/lib/hero-icon";
import { useNavigate } from "@remix-run/react";

export default function Resource() {
  const { group, version, plural, system, namespace, name } = useParams();
  const navigate = useNavigate();
  const { resourceTypes, resources, eventsPerObject, setSelectedResourceId } =
    useContext(ResourceContext);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  const selectedResource = useMemo(() => {
    return resources
      .get(`${group}/${version}/${plural}`)
      ?.get(
        `kblocks://${group}/${version}/${plural}/${system}/${namespace}/${name}`,
      );
  }, [resources, group, version, plural, system, namespace, name]);

  useEffect(() => {
    // resource was loaded
    if (selectedResource) {
      setSelectedResourceId({
        objType: selectedResource?.objType,
        objUri: selectedResource?.objUri,
      });
    }
    // resource was deleted
    if (deleteInProgress && !selectedResource) {
      setDeleteInProgress(false);
      setSelectedResourceId(undefined);
      navigate("/");
    }
  }, [selectedResource, deleteInProgress]);

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
    <div className="flex h-screen flex-col bg-slate-50">
      <div className="flex w-full items-center justify-between border-b bg-slate-50 p-2 pl-6">
        <div className="flex items-center space-x-4">
          <Button
            // className="bg-slate-100"
            variant="ghost"
            onClick={() => {
              setSelectedResourceId(undefined);
              navigate("/");
            }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {/* <span className="text-muted-foreground text-sm">Back</span> */}
          </Button>
          <div className="flex items-center space-x-4">
            {Icon && <Icon className={`${iconColor} h-8 w-8`} />}
            <div>
              <h1 className="text-2xl font-bold">
                {selectedResource.metadata.name}
              </h1>
              <p className="text-muted-foreground flex gap-4 text-sm">
                {selectedResource?.metadata.namespace}
                <SystemBadge blockUri={selectedResource.objUri} />
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <StatusBadge obj={selectedResource} />
          <ResourceActionsMenu
            resource={selectedResource}
            resourceType={selectedResourceType}
            onDeleteClick={() => {
              setDeleteInProgress(true);
            }}
          />
        </div>
      </div>
      <ScrollArea className="h-[calc(100vh-8rem)] p-6">
        <ResourceInfo
          selectedResource={selectedResource}
          selectedResourceType={selectedResourceType}
          eventsPerObject={eventsPerObject}
        />
      </ScrollArea>
    </div>
  );
}

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
      <section className="border-b pb-2">
        <h3 className="mb-2 text-lg font-semibold">Properties</h3>
        <dl className="grid grid-cols-[minmax(4rem,auto)_1fr] gap-x-4 gap-y-2">
          <dt className="text-muted-foreground flex items-center justify-start whitespace-nowrap text-sm font-medium">
            Type
          </dt>
          <dd className="flex items-center">
            {selectedResourceType?.group}/{selectedResourceType?.version}.
            {selectedResourceType?.kind}
          </dd>
          <dt className="text-muted-foreground flex items-center justify-start whitespace-nowrap text-sm font-medium">
            Status
          </dt>
          <dd className="flex items-center">
            <StatusBadge obj={selectedResource} showMessage={true} />
          </dd>
        </dl>
      </section>
      {outputsEntries.length > 0 && (
        <section className="border-b pb-2">
          <h3 className="mb-2 text-lg font-semibold">Outputs</h3>
          <dl className="grid grid-cols-[minmax(4rem,auto)_1fr] gap-x-4 gap-y-2">
            {outputsEntries
              .slice(0, outputsExpanded ? undefined : 3)
              .map(([key, value]) => (
                <Fragment key={key}>
                  <dt className="text-muted-foreground flex items-center justify-start text-sm font-medium">
                    {key}
                  </dt>
                  <dd key={`${key}-value`} className="flex items-center">
                    {formatValue(value)}
                  </dd>
                </Fragment>
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
      )}
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
