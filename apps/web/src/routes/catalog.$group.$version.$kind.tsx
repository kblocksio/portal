import { createFileRoute } from "@tanstack/react-router";
import { useContext, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { MarkdownWrapper } from "@/components/markdown";
import { ResourceContext, ResourceType } from "@/resource-context";
import { useAppContext } from "@/app-context";

export const Route = createFileRoute("/catalog/$group/$version/$kind")({
  component: Catalog,
});

function Catalog() {
  const { setBreadcrumbs } = useAppContext();
  const { resourceTypes } = useContext(ResourceContext);
  const { group, version, kind } = Route.useParams();
  const [currentResourceType, setCurrentResourceType] =
    useState<ResourceType | null>(null);

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
    <div className={cn("container mx-auto flex flex-col gap-4")}>
      {currentResourceType && (
        <MarkdownWrapper content={currentResourceType.readme || ""} />
      )}
    </div>
  );
}
