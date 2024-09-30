import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "~/components/ui/sheet"
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area"
import { useContext, useEffect, useMemo } from "react";
import { Resource, ResourceContext } from "~/ResourceContext";
import { getIconComponent, getResourceIconColors } from "~/lib/hero-icon";
import { StatusBadge } from "./resource-row";
import { useFetch } from "~/hooks/use-fetch";
import { type LogEvent } from "@kblocks/cli/types";

export function ResourceDrawerComponent() {
  const { selectedResource, setSelectedResource, resourceTypes, logs } = useContext(ResourceContext);
  const selectedResourceType = useMemo(() => selectedResource ? resourceTypes[selectedResource.objType] : undefined, [resourceTypes, selectedResource]);
  const Icon = useMemo(() => getIconComponent({ icon: selectedResourceType?.icon }), [selectedResourceType]);

  const logsUrl = (resource?: Resource) => {
    const uri = resource?.objUri.split("kblocks://")[1];
    return `/api/resources/${uri}/logs`;
  }

  const { data: oldLogs, refetch } = useFetch(logsUrl(selectedResource), {}, false);
  useEffect(() => {
    if (selectedResource) {
      refetch(logsUrl(selectedResource));
    }
  }, [selectedResource, refetch]);

  const finalLogs = useMemo(() => {
    const resourceLogs = selectedResource ? logs.get(selectedResource?.objUri) : {};
    const map: Record<string, LogEvent> = { ...resourceLogs };
    for (const entry of (oldLogs as any)?.logs ?? []) {
      map[entry.timestamp] = entry;
    }

    const result = [];
    for (const entry of Object.keys(map).sort().map(k => map[k])) {
      for (const line of entry.message.split("\n")) {
        result.push({ ...entry, message: line });
      }
    }
    return result;
  }, [oldLogs, logs, selectedResource]);

  const iconColor = getResourceIconColors({
    color: selectedResource?.color,
  });

  const readyCondition = useMemo(() => selectedResource?.status?.conditions?.find((condition: any) => condition.type === "Ready"), [selectedResource?.status?.conditions]);
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

  return (
    <Sheet open={!!selectedResource} onOpenChange={x => !x ? setSelectedResource(undefined) : null}>
      <SheetContent className="min-w-[1000px] sm:w-[540px] sm:max-w-[50vw] flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold flex items-center gap-2">
            <Icon className={`${iconColor} h-7 w-7`} />
            <span className="text-muted-foreground whitespace-nowrap">
              {selectedResource?.metadata.namespace}
            </span>
            <span className="text-muted-foreground mx-1">·</span>
            {selectedResource?.metadata.name}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4 flex-grow flex flex-col overflow-hidden">
          <div>
            <h1 className="text-sm font-medium text-gray-500">Type</h1>
            <p className="mt-1 text-sm">{selectedResourceType?.group}/{selectedResourceType?.version}.{selectedResourceType?.kind}</p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-500">Status</h2>
            <div className="mt-1 flex items-center">
              <StatusBadge readyCondition={readyCondition} />
              <span className="ml-2 text-sm capitalize">{readyCondition?.message}</span>
            </div>
          </div>
          {Object.keys(properties).length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-gray-500">Properties</h2>
              <dl className="mt-1 text-sm">
                {Object.entries(properties).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <dt className="font-mono">{key}</dt>
                    <dd className="font-mono">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
          {Object.keys(outputs).length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-gray-500">Outputs</h2>
              <dl className="mt-1 text-sm">
                {Object.entries(outputs).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <dt className="font-mono">{key}</dt>
                    <dd className="font-mono">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
          <div className="flex-grow overflow-hidden">
            <h2 className="text-sm font-medium text-gray-500">Logs</h2>
            <div className="mt-1 border rounded-md h-full">
              <ScrollArea className="h-full w-full bg-gray-900 text-gray-200" type="hover">
                <pre className="text-xs font-extralight font-mono whitespace-pre p-4 pb-10">
                  {finalLogs?.map((p, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span key={p.timestamp} className="text-gray-500">{p.timestamp}</span>
                      <span className={renderLevel(p.level)?.color}>{renderLevel(p.level)?.text}</span>
                      <span className="text-white">{p.message.trim()}</span>
                    </div>
                  ))}
                </pre>
                <ScrollBar orientation="horizontal" />
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function renderLevel(level: any) {
  switch (level) {
    case 0:
      return { text: "DEBUG", color: "text-gray-500" };
    case 1:
      return { text: "INFO ", color: "text-blue-500" };
    case 4:
      return { text: "ERROR", color: "text-red-500" };
    case 3:
      return { text: "WARN ", color: "text-yellow-500" };
  }
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
