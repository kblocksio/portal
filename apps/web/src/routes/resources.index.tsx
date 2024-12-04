import { createFileRoute } from "@tanstack/react-router";

import { ResourceTable } from "@/components/resource-table/resource-table";
import { useIconComponent } from "@/lib/get-icon";
import { RoutePageHeader } from "@/components/route-page-header";
import { useAppContext } from "@/app-context";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { map } from "zod";

export const Route = createFileRoute("/resources/")({
  component: Resources,
});

export const meta = {
  description:
    "Here is a comprehensive list of resources associated with your account. You can manage these resources, view their status, edit, update, delete, check logs, and access detailed information, relationships, and other useful insight",
  icon: "heroicon://list-bullet",
};

function Resources() {
  const { setBreadcrumbs } = useAppContext();

  useEffect(() => {
    setBreadcrumbs([{ name: "Resources" }]);
  }, [setBreadcrumbs]);

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
// const LoadingSkeleton = () => {
//   return (
//     <div className="space-y-8">
//       {[...Array(3)].map((_, index) => (
//         <div key={index} className="w-full">
//           <div className="space-y-4">
//             <div className="flex items-center space-x-4">
//               <Skeleton className="h-6 w-6" />
//               <Skeleton className="h-6 w-16" />
//             </div>
//             <div className="flex grow items-center justify-between">
//               <div className="flex grow items-center space-x-4 sm:w-auto">
//                 <Skeleton className="h-4 w-4 rounded-full" />
//                 <Skeleton className="h-4 w-full sm:max-w-40" />
//               </div>
//               <Skeleton className="hidden h-4 w-32 sm:block" />
//             </div>
//             <div className="flex w-full items-center justify-between">
//               <div className="flex grow items-center space-x-4 sm:w-auto">
//                 <Skeleton className="h-4 w-4 rounded-full" />
//                 <Skeleton className="h-4 w-full sm:max-w-40" />
//               </div>
//               <Skeleton className="hidden h-4 w-32 sm:block" />
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };
