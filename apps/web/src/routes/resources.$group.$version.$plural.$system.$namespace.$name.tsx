import { useState, useContext, useEffect, useMemo } from "react";
import { CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Resource, ResourceContext } from "@/resource-context";
import { StatusBadge } from "@/components/status-badge";
import { SystemBadge } from "@/components/system-badge";
import Timeline from "@/components/events/timeline";
import { getIconColors } from "@/lib/get-icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { PropertyKey, PropertyValue } from "@/components/ui/property";
import { RelationshipGraph } from "@/components/relationships/graph";
import { YamlView } from "@/components/yaml-button";
import { cloneDeep } from "lodash";
import { ProjectItems, ProjectsMenu } from "@/components/projects-menu";

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
    objects,
    eventsPerObject,
    setSelectedResourceId,
    relationships,
  } = useContext(ResourceContext);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const { setBreadcrumbs } = useAppContext();
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash && ["details", "logs", "relationships", "yaml"].includes(hash)) {
        setActiveTab(hash);
      } else {
        window.location.hash = DEFAULT_TAB;
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

  const [lastEventCount, setLastEventCount] = useState(
    Object.keys(eventsPerObject?.[objUri] ?? {}).length,
  );

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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Projects
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <ProjectItems objUri={selectedResource.objUri} />
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

      <Tabs
        value={activeTab}
        className="w-full"
        onValueChange={(value) => {
          setActiveTab(value);
          window.location.hash = value;
        }}
      >
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
                <div className="grid auto-rows-[32px] grid-cols-[auto_1fr] gap-x-6 gap-y-1 sm:grid-cols-[minmax(6rem,_auto)_1fr] sm:gap-x-8">
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
                <ResourceTable resources={children} showActions={false} />
              </div>
            )}
          </CardContent>
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
