import { useState, useEffect, useMemo, useContext } from "react";
import { CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronsUpDown, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { StatusBadge } from "@/components/status-badge";
import { SystemBadge } from "@/components/system-badge";
import Timeline from "@/components/events/timeline";
import { ResourceIcon } from "@/lib/get-icon";
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
import {
  getResourceProperties,
  getResourceOutputs,
  propertiesBlackList,
} from "@/lib/utils";
import { NamespaceBadge } from "@/components/namespace-badge";
import { useBreadcrumbs } from "@/app-context";
import { KeyValueList } from "@/components/resource-key-value-list";
import Outputs from "@/components/outputs";
import {
  ResourceTable,
  useResourceTable,
} from "@/components/resource-table/resource-table";
import { RelationshipGraph } from "@/components/relationships/graph";
import { YamlView } from "@/components/yaml-button";
import { cloneDeep, omit } from "lodash";
import { ProjectItems } from "@/components/projects-menu";
import { trpc } from "@/trpc";
import { LocationContext } from "@/location-context";
import type { Resource } from "@kblocks-portal/server";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import { Skeleton } from "@/components/ui/skeleton";

const DEFAULT_TAB = "details";

export const Route = createFileRoute(
  "/resources/$group/$version/$plural/$system/$namespace/$name",
)({
  component: ResourcePage,
});

function ResourcePage() {
  const { group, version, plural, system, namespace, name } = Route.useParams();
  const navigate = useNavigate();
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const previousRoute = useContext(LocationContext);

  const firstPathSegment = useMemo(() => {
    if (previousRoute?.previousRoute) {
      return previousRoute.previousRoute.split("/")[1] || "/resources";
    }
    return "/resources";
  }, [previousRoute]);

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

  const { data: selectedResource } = trpc.getResource.useQuery({
    objUri,
  });
  // const selectedResource = undefined;

  const relationships = useMemo(() => {
    return selectedResource?.relationships;
  }, [selectedResource]);

  const ownerResourceURI = useMemo(() => {
    const relationship = relationships?.find(
      (relationship) => relationship.type === "parent",
    );

    return relationship?.resource.objUri;
  }, [relationships]);

  const [lastEventCount, setLastEventCount] = useState<number>(-1);
  const [showLogsBadge, setShowLogsBadge] = useState(false);

  const events = trpc.listEvents.useQuery(
    {
      objUri,
    },
    {
      initialData: [],
    },
  );
  useEffect(() => {
    setShowLogsBadge(events.data.length > lastEventCount);
    setLastEventCount(events.data.length);
  });

  useEffect(() => {
    if (deleteInProgress && !selectedResource) {
      setDeleteInProgress(false);
      navigate({ to: "/resources" });
    }
  }, [selectedResource, deleteInProgress, navigate]);

  const selectedResourceType = useMemo(
    () => selectedResource?.type,
    [selectedResource],
  );
  // const selectedResourceType = undefined;

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
    return relationships
      ?.filter((relationship) => relationship.type === "child")
      .map((relationship) => relationship.resource);
  }, [relationships]);

  useBreadcrumbs(() => {
    const breadcrumbs = [
      {
        name: firstPathSegment
          .replace(/^\//, "")
          .replace(/^\w/, (c) => c.toUpperCase()),
        url: `/${firstPathSegment}`,
      },
    ];
    if (!selectedResource) return breadcrumbs;
    if (ownerResourceURI) {
      breadcrumbs.push({
        name: selectedResource.metadata.name,
        url: `/resources/${ownerResourceURI.replace("kblocks://", "")}`,
      });
    }
    return [
      ...breadcrumbs,
      {
        name: selectedResource.metadata.name,
      },
    ];
  }, [selectedResource, ownerResourceURI]);

  const yamlObject = useMemo(() => {
    const obj: any = omit(
      cloneDeep(selectedResource ?? {}),
      propertiesBlackList,
    );
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

  // if (!selectedResource) {
  //   // TODO: show loading state
  //   return <div>Loading...</div>;
  // }

  return (
    <div className="container mx-auto flex flex-col gap-4 py-4 sm:gap-8 sm:py-8">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col justify-between gap-x-4 space-y-4 sm:flex-row sm:items-center sm:space-y-0">
          <div className="flex w-full shrink flex-col gap-6 truncate">
            <div className="flex items-center gap-4 truncate">
              <div className="relative">
                {selectedResourceType ? (
                  <ResourceIcon
                    icon={selectedResourceType?.icon}
                    className="size-12"
                  />
                ) : (
                  <Skeleton className="size-12" />
                )}
              </div>
              <div className="flex min-w-0 flex-col truncate">
                {selectedResourceType ? (
                  <p className="text-muted-foreground truncate text-sm leading-none">
                    {selectedResourceType?.group}/
                    {selectedResourceType?.version}.{selectedResourceType?.kind}
                  </p>
                ) : (
                  <Skeleton className="h-4 w-48" />
                )}
                {selectedResource ? (
                  <h1 className="truncate text-2xl font-bold">
                    {selectedResource.metadata.name}
                  </h1>
                ) : (
                  <Skeleton className="mt-2 h-6 w-96" />
                )}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Projects
                  <ChevronsUpDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <ProjectItems objUris={[objUri]} />
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
                {selectedResource ? (
                  selectedResource.status?.conditions?.map((condition) => (
                    <StatusBadge
                      key={condition.type}
                      conditions={selectedResource?.status?.conditions ?? []}
                      showMessage
                      type={condition.type}
                    />
                  ))
                ) : (
                  <Skeleton className="h-4 w-32" />
                )}
              </div>

              <p className="text-muted-foreground text-xs leading-none">
                Namespace
              </p>
              <div className="flex truncate text-xs sm:text-sm">
                {selectedResource?.metadata?.namespace ? (
                  <NamespaceBadge object={selectedResource} />
                ) : (
                  <Skeleton className="h-4 w-32" />
                )}
              </div>

              <p className="text-muted-foreground text-xs leading-none">
                Cluster
              </p>
              <div className="flex truncate text-xs sm:text-sm">
                {selectedResource ? (
                  <SystemBadge object={selectedResource} />
                ) : (
                  <Skeleton className="h-4 w-32" />
                )}
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
        {selectedResource ? (
          <>
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
                        resource={selectedResource}
                        properties={properties}
                      />
                    </div>
                  </div>
                )}

                {/* Outputs */}
                {selectedResource?.type &&
                  outputs &&
                  Object.keys(outputs).length > 0 && (
                    <div className="w-full">
                      <div className="pb-4 sm:pt-6">
                        <CardTitle>Outputs</CardTitle>
                      </div>
                      <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 sm:grid-cols-[minmax(6rem,_auto)_1fr] sm:gap-x-8">
                        <Outputs
                          outputs={outputs}
                          resource={selectedResource}
                        />
                      </div>
                    </div>
                  )}

                {/* Children */}
                {children && children.length > 0 && (
                  <div className="w-full">
                    <div className="pb-4 sm:pt-6">
                      <CardTitle>Children</CardTitle>
                    </div>
                    <ChildrenResourceTable resources={children} />
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="logs">
              <CardContent className="h-full p-0">
                {selectedResource && (
                  <div className="pt-4 sm:pt-6">
                    <Timeline events={events.data} />
                  </div>
                )}
              </CardContent>
            </TabsContent>

            <TabsContent value="relationships">
              <div className="flex h-[640px] flex-col gap-8 pt-4 sm:pt-6">
                <RelationshipGraph objUri={objUri} />
              </div>
            </TabsContent>
            <TabsContent value="yaml">
              <CardContent className="h-full p-0">
                <YamlView object={yamlObject} />
              </CardContent>
            </TabsContent>
          </>
        ) : (
          <div className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 sm:grid-cols-[minmax(6rem,_auto)_1fr] sm:gap-x-8">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        )}
      </Tabs>

      {selectedResource && (
        <>
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
        </>
      )}
    </div>
  );
}

const ChildrenResourceTable = ({ resources }: { resources: Resource[] }) => {
  const table = useResourceTable({
    data: resources,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
  return (
    <ResourceTable table={table} showActions={false} showCreateNew={false} />
  );
};

export default ResourcePage;
