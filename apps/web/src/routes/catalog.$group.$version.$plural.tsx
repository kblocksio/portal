import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useContext, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { MarkdownWrapper } from "@/components/markdown";
import { ResourceContext, ResourceType } from "@/resource-context";
import { useAppContext } from "@/app-context";
import { useCreateResourceWizard } from "@/create-resource-wizard-context";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/catalog/$group/$version/$plural")({
  component: Catalog,
});

function Catalog() {
  const { setBreadcrumbs } = useAppContext();
  const { resourceTypes } = useContext(ResourceContext);
  const navigate = useNavigate();
  const { group, version, plural } = Route.useParams();
  const [currentResourceType, setCurrentResourceType] =
    useState<ResourceType | null>(null);
  const { openWizard } = useCreateResourceWizard();

  const onCreateResource = useCallback(
    (resourceType: ResourceType) => {
      openWizard(undefined, resourceType, 2);
    },
    [openWizard],
  );

  useEffect(() => {
    setBreadcrumbs([
      {
        name: "Catalog",
        url: "/catalog/",
      },
      {
        name: `${group}/${version}/${plural}`,
      },
    ]);
    if (resourceTypes) {
      setCurrentResourceType(resourceTypes[`${group}/${version}/${plural}`]);
    }
  }, [resourceTypes, group, version, plural]);

  return (
    <div className={cn("container relative mx-auto flex flex-col gap-4")}>
      {currentResourceType && (
        <>
          {/* fixed position bellow the app header with some margin - app header is h-16 */}
          <Button
            className="absolute right-0 top-0 z-10"
            onClick={() => {
              navigate({
                to: `/resources/new/${group}/${version}/${plural}`,
              });
            }}
          >
            New Resource...
          </Button>
          <MarkdownWrapper content={currentResourceType.readme || ""} />
        </>
      )}
    </div>
  );
}
