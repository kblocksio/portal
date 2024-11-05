import { useState, useContext, useEffect, useMemo } from "react";
import { CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  RelationshipType,
  Resource,
  ResourceContext,
} from "@/resource-context";
import { StatusBadge } from "@/components/status-badge";
import { SystemBadge } from "@/components/system-badge";
import Timeline from "@/components/events/timeline";
import { getIconColors } from "@/lib/get-icon";
import { useCreateResourceWizard } from "@/create-resource-wizard-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteResourceDialog } from "@/components/delete-resource";
import { ReapplyResourceDialog } from "@/components/reapply-resource";
import { ReadResourceDialog } from "@/components/read-resource";
import { BlockUriComponents, formatBlockUri } from "@kblocks/api";
import { getResourceProperties, getResourceOutputs } from "@/lib/utils";
import { NamespaceBadge } from "@/components/namespace-badge";
import { useAppContext } from "@/app-context";
import {
  KeyValueList,
  PropertyKey,
  PropertyValue,
} from "@/components/resource-key-value-list";
import Outputs from "@/components/outputs";
import { ResourceTable } from "@/components/resource-table/resource-table";

export function urlForResource(blockUri: BlockUriComponents) {
  return `/resources/${blockUri.group}/${blockUri.version}/${blockUri.plural}/${blockUri.system}/${blockUri.namespace}/${blockUri.name}`;
}

export const Route = createFileRoute(
  "/resources/$group/$version/$plural/$system/$namespace/$name",
)({
  component: ResourcePage,
});

function ResourcePage() {
  const { group, version, plural, system, namespace, name } = Route.useParams();
  const router = useRouter();
  const {
    resourceTypes,
    objects,
    eventsPerObject,
    setSelectedResourceId,
    relationships,
  } = useContext(ResourceContext);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const { setBreadcrumbs } = useAppContext();

  const objUri = formatBlockUri({
    group,
    version,
    plural,
    system,
    namespace,
    name,
  });

  const [lastEventCount, setLastEventCount] = useState(0);
  const events = useMemo(
    () => Object.values(eventsPerObject[objUri] ?? {}),
    [eventsPerObject, objUri],
  );
  const showLogsBadge = useMemo(
    () => events.length > lastEventCount,
    [events, lastEventCount],
  );

  const selectedResource = useMemo(() => objects[objUri], [objects, objUri]);

  useEffect(() => {
    if (selectedResource) {
      setSelectedResourceId({
        objType: selectedResource?.objType,
        objUri: selectedResource?.objUri,
      });
    }
  }, [selectedResource, setSelectedResourceId]);

  useEffect(() => {
    if (deleteInProgress && !selectedResource) {
      setDeleteInProgress(false);
      setSelectedResourceId(undefined);
      router.history.back();
    }
  }, [selectedResource, deleteInProgress, setSelectedResourceId, router]);

  const selectedResourceType = useMemo(
    () =>
      selectedResource ? resourceTypes[selectedResource.objType] : undefined,
    [resourceTypes, selectedResource],
  );

  const Icon = selectedResourceType?.iconComponent;

  const iconColor = useMemo(
    () => getIconColors({ color: selectedResource?.color }),
    [selectedResource],
  );

  const { openWizard: openEditWizard } = useCreateResourceWizard();

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isReapplyOpen, setIsReapplyOpen] = useState(false);
  const [isReadOpen, setIsReadOpen] = useState(false);

  const properties = useMemo(() => {
    return selectedResource ? getResourceProperties(selectedResource) : {};
  }, [selectedResource]);

  const outputs = useMemo(() => {
    return selectedResource ? getResourceOutputs(selectedResource) : {};
  }, [selectedResource]);

  const children = useMemo(() => {
    if (!selectedResource) {
      return [];
    }

    const children: Resource[] = [];
    const rels = relationships[selectedResource.objUri] ?? {};
    for (const [relUri, rel] of Object.entries(rels)) {
      if (rel.type === RelationshipType.CHILD) {
        children.push(objects[relUri]);
      }
    }

    return children;
  }, [selectedResource, relationships, objects]);

  useEffect(() => {
    if (!selectedResource) return;
    setBreadcrumbs([
      {
        name: "Resources",
        url: `/resources/`,
      },
      {
        name: selectedResource.metadata.name,
      },
    ]);
  }, [selectedResource, setBreadcrumbs]);

  if (!selectedResource || !selectedResourceType) {
    return null;
  }

  return (
    <div className="container mx-auto flex flex-col gap-4 py-4 sm:gap-12 sm:py-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
          <div className="flex items-center gap-4">
            <div className="relative">
              {Icon && <Icon className={`h-10 w-10 ${iconColor}`} />}
            </div>
            <div className="flex min-w-0 flex-col">
              <h1 className="truncate text-2xl font-bold">
                {selectedResource.metadata.name}
              </h1>
              <p className="text-muted-foreground truncate text-sm leading-none">
                {selectedResourceType?.group}/{selectedResourceType?.version}.
                {selectedResourceType?.kind}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="default"
              onClick={() =>
                openEditWizard(selectedResource, selectedResourceType)
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
                <DropdownMenuItem onSelect={() => setIsReapplyOpen(true)}>
                  Reapply
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setIsReadOpen(true)}>
                  Refresh
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onSelect={() => setIsDeleteOpen(true)}
                >
                  Delete...
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="border-border h-auto w-full justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="details"
            className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 pb-2 pt-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Details
          </TabsTrigger>
          <TabsTrigger
            value="logs"
            onClick={() => setLastEventCount(events.length)}
            className="data-[state=active]:border-primary relative flex items-center gap-2 rounded-none border-b-2 border-transparent px-4 pb-2 pt-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Logs
            {showLogsBadge && (
              <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
            )}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <CardContent className="flex flex-col gap-8">
            {/* Status */}
            <div className="w-full">
              <div className="pb-4 pt-4 sm:pt-6">
                <CardTitle>Status</CardTitle>
              </div>

              <div className="grid auto-rows-[28px] grid-cols-[auto_1fr] gap-x-6 gap-y-1 sm:grid-cols-[minmax(6rem,_auto)_1fr] sm:gap-x-8">
                <PropertyKey>Status</PropertyKey>
                <PropertyValue>
                  <div className="flex gap-2">
                    {selectedResource.status?.conditions?.map((condition) => (
                      <StatusBadge
                        key={condition.type}
                        obj={selectedResource}
                        showMessage
                        type={condition.type}
                      />
                    ))}
                  </div>
                </PropertyValue>

                <PropertyKey>Namespace</PropertyKey>
                <PropertyValue>
                  {selectedResource.metadata.namespace && (
                    <NamespaceBadge
                      namespace={selectedResource.metadata.namespace}
                    />
                  )}
                </PropertyValue>

                <PropertyKey>Cluster</PropertyKey>
                <PropertyValue>
                  <SystemBadge blockUri={selectedResource.objUri} />
                </PropertyValue>
              </div>
            </div>

            {/* Properties */}
            {Object.keys(properties).length > 0 && (
              <div className="w-full">
                <div className="pb-4 sm:pt-6">
                  <CardTitle>Properties</CardTitle>
                </div>
                <div className="grid auto-rows-[32px] grid-cols-[auto_1fr] gap-x-6 gap-y-1 sm:grid-cols-[minmax(6rem,_auto)_1fr] sm:gap-x-8">
                  <KeyValueList
                    data={properties}
                    resourceObjUri={selectedResource.objUri}
                  />
                </div>
              </div>
            )}

            {/* Outputs */}
            {outputs && Object.keys(outputs).length > 0 && (
              <div className="w-full">
                <div className="pb-4 sm:pt-6">
                  <CardTitle>Outputs</CardTitle>
                </div>
                <div className="grid auto-rows-[28px] grid-cols-[auto_1fr] gap-x-6 gap-y-1 sm:grid-cols-[minmax(6rem,_auto)_1fr] sm:gap-x-8">
                  <Outputs
                    outputs={outputs}
                    resourceObjUri={selectedResource.objUri}
                    resourceType={selectedResourceType}
                  />
                </div>
              </div>
            )}

            {/* Children */}
            {children.length > 0 && (
              <div className="w-full">
                <div className="pb-4 sm:pt-6">
                  <CardTitle>Children</CardTitle>
                </div>
                <ResourceTable
                  resources={children}
                  showActions={false}
                  className="w-full"
                />
              </div>
            )}
          </CardContent>
        </TabsContent>
        <TabsContent value="logs">
          <div className="flex flex-col gap-8">
            <CardContent className="h-full pt-2 sm:pt-6">
              {selectedResource && (
                <Timeline events={events} className="mt-0" />
              )}
            </CardContent>
          </div>
        </TabsContent>
      </Tabs>

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
      <ReapplyResourceDialog
        resource={selectedResource}
        isOpen={isReapplyOpen}
        onReapplyClick={() => {}}
        onClose={() => {
          setIsReapplyOpen(false);
        }}
      />
      <ReadResourceDialog
        resource={selectedResource}
        isOpen={isReadOpen}
        onClose={() => {
          setIsReadOpen(false);
        }}
      />
    </div>
  );
}

export default ResourcePage;
