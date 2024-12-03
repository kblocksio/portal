import { ResourceContext, ResourceType } from "@/resource-context";
import { formatBlockUri, parseBlockUri } from "@kblocks/api";
import { createFileRoute } from "@tanstack/react-router";
import { useContext, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAppContext } from "@/app-context";
import { ObjectMetadata } from "@repo/shared";
import { useCreateResource } from "@/create-resource-context";
import { WizardSimpleHeader } from "@/components/wizard-simple-header";
import { ResourceForm } from "@/components/resource-form/resource-form";
import { LocationContext } from "@/location-context";

export const Route = createFileRoute(
  "/resources/edit/$group/$version/$plural/$system/$namespace/$name",
)({
  component: EditResourcePage,
});

function EditResourcePage() {
  const { group, version, plural, system, namespace, name } = Route.useParams();
  const { resourceTypes, resources, clusters } = useContext(ResourceContext);
  const { handleCreateOrEdit, isLoading } = useCreateResource();
  const { setBreadcrumbs } = useAppContext();
  const navigate = useNavigate();
  const previousRoute = useContext(LocationContext);

  const objects = useMemo(() => {
    return {
      ...resources,
      ...clusters,
    };
  }, [resources, clusters]);

  const firstPathSegment = useMemo(() => {
    if (previousRoute?.previousRoute) {
      return previousRoute.previousRoute.split("/")[1];
    }
    return "/resources";
  }, [previousRoute]);

  useEffect(() => {
    setBreadcrumbs([
      {
        name: firstPathSegment
          .replace(/^\//, "")
          .replace(/^\w/, (c) => c.toUpperCase()),
        url: `/${firstPathSegment}`,
      },
      {
        name: `${name}`,
        url: `/resources/${group}/${version}/${plural}/${system}/${namespace}/${name}`,
      },
      {
        name: `Edit`,
      },
    ]);
  }, []);

  const objUri = formatBlockUri({
    group,
    version,
    plural,
    system,
    namespace,
    name,
  });

  const selectedResource = useMemo(() => objects[objUri], [objects, objUri]);

  const selectedResourceType = useMemo(
    () =>
      Object.values(resourceTypes).find(
        (resourceType: ResourceType) =>
          resourceType.group === group &&
          resourceType.version === version &&
          resourceType.plural === plural,
      ),
    [resourceTypes, group, version, plural],
  );

  const handleEdit = useCallback(
    async (meta: ObjectMetadata, values: any) => {
      if (!selectedResource || !selectedResourceType) {
        return;
      }

      delete values.metadata?.system;

      await handleCreateOrEdit(meta.system, selectedResourceType, {
        apiVersion: `${selectedResource.group}/${selectedResource.version}`,
        kind: selectedResource.kind,
        metadata: {
          name: meta.name,
          namespace: meta.namespace,
        },
        ...values,
      });

      // go to the resource page
      navigate({
        to: `/${firstPathSegment}`,
      });
    },
    [
      selectedResource,
      selectedResourceType,
      handleCreateOrEdit,
      navigate,
      firstPathSegment,
    ],
  );

  function renderInitialMeta(objUri?: string): Partial<ObjectMetadata> {
    if (!objUri) {
      return {};
    }

    const uri = parseBlockUri(objUri);
    return {
      system: uri.system,
      namespace: uri.namespace,
      name: uri.name,
    };
  }

  return (
    <div className="flex flex-col gap-4 py-4 sm:gap-12 sm:py-8">
      {selectedResourceType && selectedResource && (
        <>
          <WizardSimpleHeader
            title={`Edit ${selectedResourceType?.kind} resource`}
            description={selectedResourceType?.description || ""}
            resourceType={selectedResourceType}
          />
          <div className="flex h-full flex-col space-y-4">
            <ResourceForm
              resourceType={selectedResourceType}
              initialValues={selectedResource}
              initialMeta={renderInitialMeta(selectedResource?.objUri)}
              isLoading={isLoading}
              handleSubmit={handleEdit}
            />
          </div>
        </>
      )}
    </div>
  );
}
