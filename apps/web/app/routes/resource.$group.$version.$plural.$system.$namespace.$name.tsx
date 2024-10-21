import React, { useState, useContext, useEffect, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ScrollArea } from "~/components/ui/scroll-area";
import { ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useParams, useNavigate } from "@remix-run/react";
import {
  ResourceContext,
  type Resource,
  type ResourceType,
} from "~/ResourceContext";
import { StatusBadge } from "~/components/status-badge";
import { SystemBadge } from "~/components/system-badge";
import { ResourceActionsMenu } from "~/components/resource-actions-menu";
import Timeline from "~/components/events/timeline";
import { getResourceIconColors } from "~/lib/hero-icon";

export default function Resource() {
  const { group, version, plural, system, namespace, name } = useParams();
  const navigate = useNavigate();
  const { resourceTypes, resources, eventsPerObject, setSelectedResourceId } =
    useContext(ResourceContext);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  const selectedResource = useMemo(() => {
    return resources
      .get(`${group}/${version}/${plural}`)
      ?.get(
        `kblocks://${group}/${version}/${plural}/${system}/${namespace}/${name}`,
      );
  }, [resources, group, version, plural, system, namespace, name]);

  useEffect(() => {
    if (selectedResource) {
      setSelectedResourceId({
        objType: selectedResource?.objType,
        objUri: selectedResource?.objUri,
      });
    }
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

  if (!selectedResource || !selectedResourceType) {
    return null;
  }

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
    <div className="flex h-screen flex-col space-y-4 overflow-auto bg-slate-50 p-4">
      <div className="flex w-full items-center justify-between bg-slate-50 p-2">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => {
              setSelectedResourceId(undefined);
              navigate("/");
            }}
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-4">
            {Icon && <Icon className={`${iconColor} h-10 w-10`} />}
            <div>
              <h1 className="text-3xl font-bold">
                {selectedResource.metadata.name}
              </h1>
              <p className="text-muted-foreground flex gap-4 text-sm">
                Namespace: {selectedResource?.metadata.namespace}
                <SystemBadge blockUri={selectedResource.objUri} />
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
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
      <div className="border-b bg-slate-50 p-6">
        <CardHeader>
          <CardTitle>Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
            <div className="text-muted-foreground flex items-center justify-start whitespace-nowrap text-sm font-medium">
              Type
            </div>
            <div className="flex items-center">
              {selectedResourceType?.group}/{selectedResourceType?.version}.
              {selectedResourceType?.kind}
            </div>
            <div className="text-muted-foreground flex items-center justify-start whitespace-nowrap text-sm font-medium">
              Status
            </div>
            <div className="flex items-center">
              <StatusBadge obj={selectedResource} showMessage={true} />
            </div>
            <KeyValueList data={properties} />
          </div>
          {Object.keys(outputs).length > 0 && (
            <>
              <CardTitle className="pb-6 pt-6">Outputs</CardTitle>
              <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
                <KeyValueList data={outputs} />
              </div>
            </>
          )}
        </CardContent>
      </div>

      <div className="bg-slate-50 p-6">
        <CardHeader>
          <CardTitle>Logs</CardTitle>
        </CardHeader>
        <CardContent className="h-full">
          {selectedResource && (
            <Timeline
              events={Object.values(
                eventsPerObject[selectedResource.objUri] ?? [],
              )}
              className="mt-0"
            />
          )}
        </CardContent>
      </div>
    </div>
  );
}

type KeyValueListProps = {
  data: Record<string, string>;
};

const KeyValueList: React.FC<KeyValueListProps> = ({ data }) =>
  Object.entries(data).map(([key, value]) => (
    <React.Fragment key={key}>
      <div className="text-muted-foreground flex items-center justify-start whitespace-nowrap text-sm font-medium">
        {key}
      </div>
      <div className="flex items-center justify-start whitespace-nowrap font-medium">
        {formatValue(value)}
      </div>
    </React.Fragment>
  ));

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
