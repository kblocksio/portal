import { useState, useContext, useEffect, useMemo } from "react";
import { CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronsUpDown, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Resource,
  ResourceContext,
  useObjectEvents,
  type WorkerEventTimestampString,
} from "@/resource-context";
import { StatusBadge } from "@/components/status-badge";
import { SystemBadge } from "@/components/system-badge";
import Timeline from "@/components/events/timeline";
import { getIconColors } from "@/lib/get-icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteResourceDialog } from "@/components/delete-resource";
import { ReapplyResourceDialog } from "@/components/reapply-resource";
import { ReadResourceDialog } from "@/components/read-resource";
import { formatBlockUri } from "@kblocks/api";
import { getResourceProperties, getResourceOutputs } from "@/lib/utils";
import { NamespaceBadge } from "@/components/namespace-badge";
import { useAppContext } from "@/app-context";
import { KeyValueList } from "@/components/resource-key-value-list";
import Outputs from "@/components/outputs";
import { ResourceTable } from "@/components/resource-table/resource-table";
import { RelationshipGraph } from "@/components/relationships/graph";
import { YamlView } from "@/components/yaml-button";
import { cloneDeep } from "lodash";
import { ProjectItems } from "@/components/projects-menu";

const DEFAULT_TAB = "details";

export const Route = createFileRoute(
  "/resources/$group/$version/$plural/$system/$namespace/$name",
)({
  component: ResourcePage,
});

function ResourcePage() {
  const { group, version, plural, system, namespace, name } = Route.useParams();
  const navigate = useNavigate();
  const {
    resourceTypes,
    resources,
    clusters,
    setSelectedResourceId,
    relationships,
  } = useContext(ResourceContext);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const { setBreadcrumbs } = useAppContext();
  const [activeTab, setActiveTab] = useState("details");
  const { projects } = useContext(ResourceContext);

  const objects = useMemo(() => {
    return {
      ...resources,
      ...clusters,
    };
  }, [resources, clusters]);
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash && ["details", "logs", "relationships", "yaml"].includes(hash)) {
        setActiveTab(hash);
      } else {
        const url = new URL(window.location.toString());
        url.hash = DEFAULT_TAB;
        location.replace(url);

        setActiveTab(DEFAULT_TAB);
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const objUri = formatBlockUri({
    group,
    version,
    plural,
    system,
    namespace,
    name,
  });

  const numberOfRelationships = useMemo(() => {
    return Object.keys(relationships).length;
  }, [relationships]);

  const ownerResourceURI = useMemo((): string | null => {
    // Wait until relationships is populated
    if (!relationships || numberOfRelationships === 0) {
      return null;
    }
    const rels = relationships[objUri];
    if (!rels) {
      return null;
    }
    let owner: string | null = null;
    Object.keys(rels)?.forEach((key) => {
      if (rels[key].type === "parent") {
        owner = key;
      }
    });
    return owner;
  }, [relationships, numberOfRelationships, objUri]);

  const [lastEventCount, setLastEventCount] = useState<number>();
  const [showLogsBadge, setShowLogsBadge] = useState(false);

  const [events, setEvents] = useState<WorkerEventTimestampString[]>([]);
  useObjectEvents(objUri, (events) => {
    setEvents(events);
    setLastEventCount(events.length);

    if (lastEventCount === undefined) {
      return;
    }

    if (activeTab === "logs") {
      return;
    }

    setShowLogsBadge(events.length > lastEventCount);
  });

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
      navigate({ to: "/resources" });
    }
  }, [selectedResource, deleteInProgress, setSelectedResourceId, navigate]);

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
      if (rel.type === "child") {
        children.push(objects[relUri]);
      }
    }

    return children;
  }, [selectedResource, relationships, objects]);

  useEffect(() => {
    if (!selectedResource) return;
    const breadcrumbs = [
      {
        name: "Resources",
        url: `/resources/`,
      },
    ];
    if (ownerResourceURI) {
      breadcrumbs.push({
        name: objects[ownerResourceURI].metadata.name,
        url: `/resources/${ownerResourceURI.replace("kblocks://", "")}`,
      });
    }
    setBreadcrumbs([
      ...breadcrumbs,
      {
        name: selectedResource.metadata.name,
      },
    ]);
  }, [selectedResource, setBreadcrumbs, ownerResourceURI, objects]);

  const yamlObject = useMemo(() => {
    const obj: any = cloneDeep(selectedResource ?? {});
    delete obj.metadata?.managedFields;
    delete obj.status?.lastStateHash;
    delete obj.objUri;
    delete obj.objType;
    return {
      apiVersion: `${obj.apiVersion}`,
      kind: obj.kind,
      metadata: obj.metadata,
      status: obj.status,
      ...obj,
    };
  }, [selectedResource]);

  if (!selectedResource || !selectedResourceType) {
    return null;
  }

  return (
    <div className="container mx-auto flex flex-col gap-4 py-4 sm:gap-8 sm:py-8">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col justify-between gap-x-4 space-y-4 sm:flex-row sm:items-center sm:space-y-0">
          <div className="flex w-full shrink flex-col gap-6 truncate">
            <div className="flex items-center gap-4 truncate">
              <div className="relative">
                {Icon && <Icon className={`size-12 ${iconColor}`} />}
              </div>
              <div className="flex min-w-0 flex-col truncate">
                <p className="text-muted-foreground truncate text-sm leading-none">
                  {selectedResourceType?.group}/{selectedResourceType?.version}.
                  {selectedResourceType?.kind}
                </p>
                <h1 className="truncate text-2xl font-bold">
                  {selectedResource.metadata.name}
                </h1>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger
                asChild
                disabled={!projects || projects.length === 0}
              >
                <Button variant="outline">
                  Projects
                  <ChevronsUpDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <ProjectItems objUris={[selectedResource.objUri]} />
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="default"
              onClick={() =>
                navigate({
                  to: `/resources/edit/${group}/${version}/${plural}/${system}/${namespace}/${name}`,
                })
              }
            >
              Edit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary">
                  <div className="-mx-2">
                    <MoreVertical className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setIsReapplyOpen(true)}>
                  Redeploy
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setIsReadOpen(true)}>
                  Refresh State
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onSelect={() => setIsDeleteOpen(true)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="py-2">
          <div className="flex">
            <div className="grid w-full grid-flow-col grid-rows-[auto_1fr] gap-x-2 gap-y-2 sm:w-auto sm:gap-x-12">
              <p className="text-muted-foreground text-xs leading-none">
                Status
              </p>
              <div className="flex flex-col items-start gap-1 text-xs sm:text-sm">
                {selectedResource.status?.conditions?.map((condition) => (
                  <StatusBadge
                    key={condition.type}
                    obj={selectedResource}
                    showMessage
                    type={condition.type}
                  />
                ))}
              </div>

              <p className="text-muted-foreground text-xs leading-none">
                Namespace
              </p>
              <div className="flex truncate text-xs sm:text-sm">
                {selectedResource.metadata.namespace && (
                  <NamespaceBadge
                    namespace={selectedResource.metadata.namespace}
                  />
                )}
              </div>

              <p className="text-muted-foreground text-xs leading-none">
                Cluster
              </p>
              <div className="flex truncate text-xs sm:text-sm">
                <SystemBadge blockUri={selectedResource.objUri} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tabs
        value={activeTab}
        className="w-full"
        onValueChange={(value) => {
          setActiveTab(value);
          const url = new URL(window.location.toString());
          url.hash = value;
          location.assign(url);
        }}
      >
        <TabsList className="border-border h-auto w-full justify-start overflow-x-auto rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="details"
            className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 pb-2 pt-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Details
          </TabsTrigger>
          <TabsTrigger
            value="logs"
            onClick={() => setShowLogsBadge(false)}
            className="data-[state=active]:border-primary relative flex items-center gap-2 rounded-none border-b-2 border-transparent px-4 pb-2 pt-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Logs
            {showLogsBadge && (
              <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
            )}
          </TabsTrigger>
          <TabsTrigger
            value="relationships"
            className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 pb-2 pt-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Relationships
          </TabsTrigger>
          <TabsTrigger
            value="yaml"
            className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 pb-2 pt-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            YAML
          </TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <div className="flex flex-col gap-8">
            {/* Properties */}
            {Object.keys(properties).length > 0 && (
              <div className="w-full">
                <div className="pb-4 pt-4 sm:pt-6">
                  <CardTitle>Properties</CardTitle>
                </div>
                <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 sm:grid-cols-[minmax(6rem,_auto)_1fr] sm:gap-x-8">
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
                <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 sm:grid-cols-[minmax(6rem,_auto)_1fr] sm:gap-x-8">
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
                  showCreateNew={false}
                />
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="logs">
          <CardContent className="h-full p-0">
            {selectedResource && (
              <div className="pt-4 sm:pt-6">
                <Timeline events={events} />
              </div>
            )}
          </CardContent>
        </TabsContent>

        <TabsContent value="relationships">
          <div className="flex h-[640px] flex-col gap-8 pt-4 sm:pt-6">
            <RelationshipGraph selectedResource={selectedResource} />
          </div>
        </TabsContent>
        <TabsContent value="yaml">
          <CardContent className="h-full p-0">
            <YamlView object={yamlObject} />
          </CardContent>
        </TabsContent>
      </Tabs>

      <DeleteResourceDialog
        resources={[selectedResource]}
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
