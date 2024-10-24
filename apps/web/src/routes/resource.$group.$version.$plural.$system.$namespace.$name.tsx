import React, { useState, useContext, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { Button } from "~/components/ui/button";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ResourceContext, type Resource } from "~/resource-context";
import { StatusBadge } from "~/components/status-badge";
import { SystemBadge } from "~/components/system-badge";
import Timeline from "~/components/events/timeline";
import { getResourceIconColors } from "~/lib/hero-icon";
import { Link } from "~/components/ui/link";
import { useCreateResourceWizard } from "~/create-resource-wizard-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { DeleteResourceDialog } from "~/components/delete-resource";

export const Route = createFileRoute(
  "/resource/$group/$version/$plural/$system/$namespace/$name",
)({
  component: Resource,
});

function Resource() {
  const { group, version, plural, system, namespace, name } = Route.useParams();
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
    if (selectedResource) {
      setSelectedResourceId({
        objType: selectedResource?.objType,
        objUri: selectedResource?.objUri,
      });
    }
    if (deleteInProgress && !selectedResource) {
      setDeleteInProgress(false);
      setSelectedResourceId(undefined);
      navigate({ to: "/" });
    }
  }, [selectedResource, deleteInProgress, setSelectedResourceId, navigate]);

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

  const { openWizard: openEditWizard } = useCreateResourceWizard();

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

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
    <div className="container mx-auto flex flex-col gap-12 px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2">
        <div>
          <Link to="/" variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to all projects
          </Link>
        </div>

        <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
          <div className="flex items-center gap-4">
            <div className="relative">
              {Icon && <Icon className={`h-10 w-10 ${iconColor}`} />}
              {/* <div
                className={`absolute bottom-0 right-0 h-3 w-3 ${getStatusColor(status)} border-background rounded-full border-2`}
              ></div> */}

              <div className="absolute bottom-0 right-0">
                <StatusBadge obj={selectedResource} size="sm" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {selectedResource.metadata.name}
              </h1>
              <p className="text-muted-foreground flex gap-4 text-sm leading-none">
                {selectedResourceType?.group}/{selectedResourceType?.version}.
                {selectedResourceType?.kind}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="default"
              onClick={() =>
                openEditWizard({
                  resource: selectedResource,
                  resourceType: selectedResourceType,
                })
              }
            >
              Edit...
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <div className="-mx-2">
                    <MoreVertical className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  className="text-destructive"
                  onSelect={() => {
                    setIsDeleteOpen(true);
                  }}
                >
                  Delete...
                </DropdownMenuItem>
              </DropdownMenuContent>

              <DeleteResourceDialog
                resource={selectedResource}
                isOpen={isDeleteOpen}
                onDeleteClick={() => {
                  // onDeleteClick?.();
                }}
                onClose={() => {
                  setIsDeleteOpen(false);
                }}
              />
            </DropdownMenu>
          </div>
        </div>
      </div>

      <Card>
        <CardContent>
          <div className="lg:flex lg:gap-4">
            <div className="lg:w-1/2">
              <div className="py-6">
                <CardTitle>Properties</CardTitle>
              </div>
              <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
                <PropertyKey>Status</PropertyKey>
                <PropertyValue>
                  <div>
                    <StatusBadge obj={selectedResource} showMessage />
                  </div>
                </PropertyValue>

                <PropertyKey>Namespace</PropertyKey>
                <PropertyValue>
                  {selectedResource.metadata.namespace}
                </PropertyValue>

                <PropertyKey>System</PropertyKey>
                <PropertyValue>
                  <SystemBadge
                    blockUri={selectedResource.objUri}
                    showSystemName
                  />
                </PropertyValue>

                <KeyValueList data={properties} />
              </div>
            </div>
            <div className="lg:w-1/2">
              <div className="py-6">
                <CardTitle>Outputs</CardTitle>
              </div>
              <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
                <KeyValueList data={outputs} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
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
      </Card>
    </div>
  );
}

const PropertyKey = ({ children }: { children: React.ReactNode }) => (
  <div className="text-muted-foreground flex items-center whitespace-nowrap text-sm font-medium">
    {children}
  </div>
);

const PropertyValue = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center overflow-hidden font-medium">
    <span className="truncate">{children}</span>
  </div>
);

type KeyValueListProps = {
  data: Record<string, string>;
};

const KeyValueList: React.FC<KeyValueListProps> = ({ data }) =>
  Object.entries(data).map(([key, value]) => (
    <React.Fragment key={key}>
      <PropertyKey>{key}</PropertyKey>
      <PropertyValue>{formatValue(value)}</PropertyValue>
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
