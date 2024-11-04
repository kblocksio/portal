import { useState, useContext, useEffect, useMemo } from "react";
import { CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ResourceContext } from "@/resource-context";
import { StatusBadge } from "@/components/status-badge";
import { SystemBadge } from "@/components/system-badge";
import Timeline from "@/components/events/timeline";
import { getResourceIconColors } from "@/lib/hero-icon";
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
  const router = useRouter();
  const {
    resourceTypes,
    objects,
    eventsPerObject,
    setSelectedResourceId,
    loadEvents,
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

  useEffect(() => {
    loadEvents(objUri);
  }, [objUri, loadEvents]);

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
    () => getResourceIconColors({ color: selectedResource?.color }),
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
    <div className="flex flex-col gap-8 py-4 sm:py-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
          <div className="flex items-center gap-4">
            <div className="relative">
              {Icon && <Icon className={`h-10 w-10 ${iconColor}`} />}
            </div>
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold">
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
          <div className="flex flex-col gap-8">
            <div className="">
              <div className="w-full">
                <div className="pb-4 pt-8">
                  <CardTitle>Status</CardTitle>
                </div>
                <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
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

                  <PropertyKey>System</PropertyKey>
                  <PropertyValue>
                    <SystemBadge blockUri={selectedResource.objUri} />
                  </PropertyValue>
                </div>
              </div>

              {/* Properties */}
              <div className="w-full">
                <div className="pb-4 pt-8">
                  <CardTitle>Properties</CardTitle>
                </div>
                <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
                  <KeyValueList
                    data={properties}
                    resourceObjUri={selectedResource.objUri}
                  />
                </div>
              </div>

              {outputs && Object.keys(outputs).length > 0 && (
                <div className="w-full">
                  <div className="pb-4 pt-8">
                    <CardTitle>Outputs</CardTitle>
                  </div>
                  <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
                    <Outputs
                      outputs={outputs}
                      resourceObjUri={selectedResource.objUri}
                      resourceType={selectedResourceType}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="logs">
          <div className="flex flex-col gap-8">
            <div className="h-full pt-6">
              {selectedResource && (
                <Timeline events={events} className="mt-0" />
              )}
            </div>
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

export default Resource;
