import { useAppContext } from "@/app-context";
import { ResourceForm } from "@/components/resource-form/resource-form";
import { WizardSimpleHeader } from "@/components/wizard-simple-header";
import { useCreateResourceWizard } from "@/create-resource-wizard-context";
import { ResourceContext, ResourceType } from "@/resource-context";
import { parseBlockUri } from "@kblocks/api";
import { ObjectMetadata } from "@repo/shared";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useContext, useEffect, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/resources/new/$group/$version/$plural")({
  component: CreateResourcePage,
});

function CreateResourcePage() {
  const { resourceTypes } = useContext(ResourceContext);
  const { handleCreateOrEdit, isLoading } = useCreateResourceWizard();
  const { setBreadcrumbs } = useAppContext();
  const { group, version, plural } = Route.useParams();
  const navigate = useNavigate();
  useEffect(() => {
    setBreadcrumbs([
      {
        name: "Resources",
        url: "/resources",
      },
      {
        name: "New",
        url: "/resources/new",
      },
      {
        name: `${group}/${version}/${plural}`,
      },
    ]);
  }, []);

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
        to: "/resources",
      });
    },
    [resourceType, handleCreateOrEdit, navigate],
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
          <div className="flex h-full flex-col space-y-4 overflow-hidden p-2">
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
