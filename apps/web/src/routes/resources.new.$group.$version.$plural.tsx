import { useBreadcrumbs } from "@/app-context";
import { ResourceForm } from "@/components/resource-form/resource-form";
import { WizardSimpleHeader } from "@/components/wizard-simple-header";
import { useCreateResource } from "@/create-resource-context";
import { LocationContext } from "@/location-context";
import { ObjectMetadata } from "@kblocks-portal/shared";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useContext, useMemo } from "react";
import { BreadcrumbItem } from "@/app-context";
import { useResourceTypes } from "@/hooks/use-resource-types";
export const Route = createFileRoute("/resources/new/$group/$version/$plural")({
  component: CreateResourcePage,
});

function CreateResourcePage() {
  const { data: resourceTypes } = useResourceTypes();
  const { handleCreateOrEdit, isLoading } = useCreateResource();
  const { group, version, plural } = Route.useParams();
  const navigate = useNavigate();
  const previousRoute = useContext(LocationContext);

  const firstPathSegment = useMemo((): string => {
    if (previousRoute?.previousRoute) {
      return previousRoute.previousRoute.split("/")[1] || "/resources";
    }
    return "/resources";
  }, [previousRoute]);

  useBreadcrumbs(() => {
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
    return breadcrumbs;
  }, [firstPathSegment]);

  const resourceType = useMemo(() => {
    if (!resourceTypes) return null;
    return Object.values(resourceTypes).find(
      (resourceType) =>
        resourceType.group === group &&
        resourceType.version === version &&
        resourceType.plural === plural,
    );
  }, [resourceTypes, group, version, plural]);

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
