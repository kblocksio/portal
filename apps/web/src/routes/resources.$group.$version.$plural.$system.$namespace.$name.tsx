import React, {
  useState,
  useContext,
  useEffect,
  useMemo,
  PropsWithChildren,
} from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ResourceContext, type Resource } from "@/resource-context";
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
import linkifyHtml from "linkify-html";
import { BlockUriComponents, formatBlockUri } from "@kblocks/api";
import { getResourceProperties, getResourceOutputs } from "@/lib/utils";
import { splitAndCapitalizeCamelCase } from "@/components/resource-form/label-formater";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateNewResourceForm } from "@/components/create-new-resource-form";
import { renderInitialMeta } from "@/components/components-utils";
import { Label } from "@/components/ui/label";

export function urlForResource(blockUri: BlockUriComponents) {
  return `/resources/${blockUri.group}/${blockUri.version}/${blockUri.plural}/${blockUri.system}/${blockUri.namespace}/${blockUri.name}`;
}

export const Route = createFileRoute(
  "/resources/$group/$version/$plural/$system/$namespace/$name",
)({
  component: Resource,
});

const tabs = [
  { label: "Details", value: "details" },
  { label: "Logs", value: "logs" },
];

function Resource() {
  const { group, version, plural, system, namespace, name } = Route.useParams();
  const router = useRouter();
  const {
    resourceTypes,
    resources,
    eventsPerObject,
    setSelectedResourceId,
    loadEvents,
  } = useContext(ResourceContext);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [selectedTab, setSelectedTab] = useState("details");

  const objUri = formatBlockUri({
    group,
    version,
    plural,
    system,
    namespace,
    name,
  });

  useMemo(() => {
    loadEvents(objUri);
  }, [objUri]);

  const selectedResource = useMemo(() => {
    return resources.get(`${group}/${version}/${plural}`)?.get(objUri);
  }, [resources, objUri]);

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
    <div className="container flex w-[100vw] flex-col gap-12 px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4">
        <div>
          <Button onClick={() => router.history.back()} variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to projects
          </Button>
        </div>

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
        <div className="mt-4 flex gap-2">
          <Label className="self-center text-sm">Status</Label>
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
        </div>
      </div>
      <Tabs
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="w-full"
      >
        <TabsList className="flex w-full gap-2">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="flex-1">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="pt-6">
            {selectedTab === "details" && (
              <div className="flex flex-col gap-1">
                <CreateNewResourceForm
                  resourceType={selectedResourceType}
                  initialMeta={renderInitialMeta(selectedResource?.objUri)}
                  initialValues={selectedResource}
                  isLoading={false}
                  readonly={true}
                />
                {outputs && Object.keys(outputs).length > 0 && (
                  <div className="flex flex-col gap-6">
                    <h2 className="text-md flex items-center whitespace-nowrap border-t pt-6 font-medium">
                      Outputs
                    </h2>
                    <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
                      <KeyValueList data={outputs} />
                    </div>
                  </div>
                )}
              </div>
            )}
            {selectedTab === "logs" && (
              <div className="h-full">
                {selectedResource && (
                  <Timeline
                    events={Object.values(
                      eventsPerObject[selectedResource.objUri] ?? [],
                    )}
                    className="mt-0"
                  />
                )}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
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
        className="text-muted-foreground flex items-center overflow-hidden font-medium"
        dangerouslySetInnerHTML={{ __html: children }}
      />
    );
  }

  return (
    <div className="text-muted-foreground flex items-center overflow-hidden font-medium">
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
      <PropertyKey>{splitAndCapitalizeCamelCase(key)}</PropertyKey>
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
