import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useContext, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { MarkdownWrapper } from "@/components/markdown";
import { ResourceContext, ResourceType } from "@/resource-context";
import { useAppContext } from "@/app-context";
import { useCreateResourceWizard } from "@/create-resource-wizard-context";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/catalog/$group/$version/$kind")({
  component: Catalog,
});

function Catalog() {
  const { setBreadcrumbs } = useAppContext();
  const { resourceTypes } = useContext(ResourceContext);
  const { group, version, kind } = Route.useParams();
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
        name: `${group}/${version}/${kind}`,
      },
    ]);
    if (resourceTypes) {
      setCurrentResourceType(resourceTypes[`${group}/${version}/${kind}`]);
    }
  }, [resourceTypes, group, version, kind]);

  return (
    <div className={cn("container relative mx-auto flex flex-col gap-4")}>
      {currentResourceType && (
        <>
          {/* fixed position bellow the app header with some margin - app header is h-16 */}
          <Button
            className="fixed right-6 top-[88px] z-10"
            onClick={() => onCreateResource(currentResourceType)}
          >
            New Resource...
          </Button>
          <MarkdownWrapper content={currentResourceType.readme || ""} />
        </>
      )}
    </div>
  );
}
