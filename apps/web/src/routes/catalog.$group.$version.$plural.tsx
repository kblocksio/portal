import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { MarkdownWrapper } from "@/components/markdown";
import { useBreadcrumbs } from "@/app-context";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { useResourceTypes } from "@/hooks/use-resource-types";

export const Route = createFileRoute("/catalog/$group/$version/$plural")({
  component: Catalog,
});

function Catalog() {
  const navigate = useNavigate();
  const { group, version, plural } = Route.useParams();

  const resourceTypeId = useMemo(
    () => `${group}/${version}/${plural}`,
    [group, version, plural],
  );
  const resourceTypes = useResourceTypes();
  const currentResourceType = useMemo(
    () => resourceTypes.data[resourceTypeId],
    [resourceTypes, resourceTypeId],
  );

  useBreadcrumbs(
    () => [
      {
        name: "Catalog",
        url: "/catalog/",
      },
      {
        name: resourceTypeId,
      },
    ],
    [group, version, plural],
  );

  return (
    <div className={cn("container relative mx-auto flex flex-col gap-4")}>
      {currentResourceType && (
        <>
          {/* fixed position bellow the app header with some margin - app header is h-16 */}
          <Button
            className="absolute right-0 top-0"
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
