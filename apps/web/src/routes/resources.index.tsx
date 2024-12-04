import { createFileRoute } from "@tanstack/react-router";

import { ResourceTable } from "@/components/resource-table/resource-table";
import { useIconComponent } from "@/lib/get-icon";
import { RoutePageHeader } from "@/components/route-page-header";
export const Route = createFileRoute("/resources/")({
  component: Resources,
});

export const meta = {
  description:
    "Here is a comprehensive list of resources associated with your account. You can manage these resources, view their status, edit, update, delete, check logs, and access detailed information, relationships, and other useful insight",
  icon: "heroicon://list-bullet",
};

function Resources() {
  const Icon = useIconComponent({ icon: meta.icon });

  return (
    <div className="flex flex-col gap-10 py-2 pt-8">
      <RoutePageHeader
        title="Resources"
        description={meta.description}
        Icon={Icon}
      />
      <div>
        <ResourceTable />
      </div>
    </div>
  );
}
