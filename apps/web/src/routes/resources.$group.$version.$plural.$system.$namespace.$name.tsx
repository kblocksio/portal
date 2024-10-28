import React, {
  useState,
  useContext,
  useEffect,
  useMemo,
  PropsWithChildren,
} from "react";
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
import linkifyHtml from "linkify-html";
import { BlockUriComponents } from "@kblocks/api";
import { getResourceProperties, getResourceOutputs } from "~/lib/utils";

export function urlForResource(blockUri: BlockUriComponents) {
  return `/resources/${blockUri.group}/${blockUri.version}/${blockUri.plural}/${blockUri.system}/${blockUri.namespace}/${blockUri.name}`;
}

export const Route = createFileRoute(
  "/resources/$group/$version/$plural/$system/$namespace/$name",
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

  const properties = useMemo(() => {
    return selectedResource ? getResourceProperties(selectedResource) : {};
  }, [selectedResource]);

  const outputs = useMemo(() => {
    return selectedResource ? getResourceOutputs(selectedResource) : {};
  }, [selectedResource]);

  if (!selectedResource || !selectedResourceType) {
    return null;
  }

  return (
    <div className="container mx-auto flex flex-col gap-12 p-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4">
        <div>
          <Link to="/" variant="ghostAlignLeft">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to projects
          </Link>
        </div>

        <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
          <div className="flex items-center gap-4">
            <div className="relative">
              {Icon && <Icon className={`h-10 w-10 ${iconColor}`} />}
            </div>
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold">
                {selectedResource.metadata.name}
                {/* <div className="align-middle">
                  <StatusBadge obj={selectedResource} size="sm" />
                </div> */}
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
                  setDeleteInProgress(true);
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
          <div className="lg:flex-col lg:gap-4">
            <div className="w-full">
              <div className="py-6">
                <CardTitle>Properties</CardTitle>
              </div>
              <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
                <PropertyKey>Status</PropertyKey>
                <PropertyValue>
                  <div className="flex gap-2"> 
                    {selectedResource.status?.conditions?.map(condition => (
                      <StatusBadge obj={selectedResource} showMessage type={condition.type} />
                    ))}
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
            {outputs && Object.keys(outputs).length > 0 && (
              <div className="w-full">
                <div className="py-6">
                  <CardTitle>Outputs</CardTitle>
                </div>
                <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
                  <KeyValueList data={outputs} />
                </div>
              </div>
            )}
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

const PropertyKey = ({ children }: PropsWithChildren) => (
  <div className="text-muted-foreground flex items-center whitespace-nowrap text-sm font-medium">
    {children}
  </div>
);

const PropertyValue = ({ children }: PropsWithChildren) => {
  if (typeof children === "string" && /<a\s/i.test(children)) {
    return (
      <div
        className="flex items-center overflow-hidden font-medium"
        dangerouslySetInnerHTML={{ __html: children }}
      />
    );
  }

  return (
    <div className="flex items-center overflow-hidden font-medium">
      <span className="truncate">{children}</span>
    </div>
  );
};

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
    return linkifyHtml(value, {
      className: "text-blue-500 hover:underline",
      target: "_blank noreferrer",
    });
  }

  if (
    typeof value === "undefined" ||
    (typeof value === "object" && value === null)
  ) {
    return "(n/a)";
  }

  return JSON.stringify(value);
}
