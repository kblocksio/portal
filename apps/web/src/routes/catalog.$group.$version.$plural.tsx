import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { MarkdownWrapper } from "@/components/markdown";
import { useBreadcrumbs } from "@/app-context";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { trpc } from "@/trpc";

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
  const { data: resourceType } = trpc.getType.useQuery({
    typeUri: resourceTypeId,
  });

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
      {resourceType && (
        <>
          {/* fixed position bellow the app header with some margin - app header is h-16 */}
          <Button
            className="absolute right-0 top-0"
            onClick={() => {
              navigate({
                to: `/resources/new/${resourceTypeId}`,
              });
            }}
          >
            New Resource...
          </Button>
          {resourceType.readme && (
            <MarkdownWrapper content={resourceType.readme} />
          )}
        </>
      )}
    </div>
  );
}
