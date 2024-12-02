import { useAppContext } from "@/app-context";
import { ResourceForm } from "@/components/resource-form/resource-form";
import { WizardSimpleHeader } from "@/components/wizard-simple-header";
import { useCreateResource } from "@/create-resource-context";
import { LocationContext } from "@/location-context";
import { ResourceContext, ResourceType } from "@/resource-context";
import { ObjectMetadata } from "@repo/shared";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useContext, useEffect, useMemo } from "react";
import { BreadcrumbItem } from "@/app-context";
export const Route = createFileRoute("/resources/new/$group/$version/$plural")({
  component: CreateResourcePage,
});

function CreateResourcePage() {
  const { resourceTypes } = useContext(ResourceContext);
  const { handleCreateOrEdit, isLoading } = useCreateResource();
  const { setBreadcrumbs } = useAppContext();
  const { group, version, plural } = Route.useParams();
  const navigate = useNavigate();
  const previousRoute = useContext(LocationContext);

  const firstPathSegment = useMemo(() => {
    if (previousRoute?.previousRoute) {
      return previousRoute.previousRoute.split("/")[1];
    }
    return "/resources";
  }, [previousRoute]);

  useEffect(() => {
    const breadcrumbs: BreadcrumbItem[] = [
      {
        name: firstPathSegment
          .replace(/^\//, "")
          .replace(/^\w/, (c) => c.toUpperCase()),
        url: `/${firstPathSegment}`,
      },
    ];
    if (firstPathSegment === "resources") {
      breadcrumbs.push({
        name: "New",
        url: "/resources/new",
      });
    }
    breadcrumbs.push({
      name: `${group}/${version}/${plural}`,
    });
    setBreadcrumbs(breadcrumbs);
  }, [firstPathSegment]);

  const resourceType = useMemo(
    () =>
      Object.values(resourceTypes).find(
        (resourceType: ResourceType) =>
          resourceType.group === group &&
          resourceType.version === version &&
          resourceType.plural === plural,
      ),
    [resourceTypes, group, version, plural],
  );

  const handleCreate = useCallback(
    async (meta: ObjectMetadata, values: any) => {
      if (!resourceType) {
        return;
      }

      delete values.metadata?.system;

      await handleCreateOrEdit(meta.system, resourceType, {
        apiVersion: `${resourceType.group}/${resourceType.version}`,
        kind: resourceType.kind,
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
    [resourceType, handleCreateOrEdit, navigate, firstPathSegment],
  );

  return (
    <div className="flex flex-col gap-4 py-4 sm:gap-12 sm:py-8">
      {resourceType && (
        <>
          <WizardSimpleHeader
            title={`New ${resourceType?.kind} resource`}
            description={resourceType?.description || ""}
            resourceType={resourceType}
          />
          <div className="flex h-full flex-col space-y-4">
            <ResourceForm
              resourceType={resourceType}
              isLoading={isLoading}
              handleSubmit={handleCreate}
            />
          </div>
        </>
      )}
    </div>
  );
}
