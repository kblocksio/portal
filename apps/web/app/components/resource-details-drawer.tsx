import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "~/components/ui/sheet"
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Resource, ResourceContext } from "~/ResourceContext";
import { getResourceIconColors } from "~/lib/hero-icon";
import { StatusBadge, SystemBadge } from "./resource-row";
import { useFetch } from "~/hooks/use-fetch";
import { type LogEvent } from "@kblocks/api";
import { useCreateResourceWizard } from "~/CreateResourceWizardContext";
import { Button } from "~/components/ui/button";
import { DeleteResourceDialog } from "./delete-resource";
import Timeline from "./events/timeline";

export const ResourceDetailsDrawer = () => {
  const { openWizard: openEditWizard } = useCreateResourceWizard();

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { selectedResourceId, setSelectedResourceId, resourceTypes, resources, eventsPerObject } = useContext(ResourceContext);

  const selectedResource = useMemo(() => {
    if (!selectedResourceId) return undefined;
    return resources.get(selectedResourceId.objType)?.get(selectedResourceId.objUri);
  }, [selectedResourceId, resources]);

  const selectedResourceType = useMemo(() => (
    selectedResource ? resourceTypes[selectedResource.objType] : undefined
  ), [resourceTypes, selectedResource]
  );

  const Icon = selectedResourceType?.iconComponent;

  const iconColor = useMemo(() => (
    getResourceIconColors({
      color: selectedResource?.color,
    })
  ), [selectedResource]);

  const properties: Record<string, string> = {};
  const outputs: Record<string, string> = {};

  addProperty(properties, {
    ...selectedResource,
    status: undefined,
    metadata: undefined,
    apiVersion: undefined,
    kind: undefined,
    objType: undefined,
    objUri: undefined,
  });

  addProperty(outputs, {
    ...selectedResource?.status,
    conditions: undefined,
  });

  return (
    <Sheet open={!!selectedResource} onOpenChange={(x) => (!x ? setSelectedResourceId(undefined) : null)}>
      <SheetContent className="min-w-[1000px] sm:w-[540px] sm:max-w-[50vw] flex flex-col h-full gap-0">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold flex items-center gap-2 ml-1 mb-0 border-b border-b-muted-foreground/10 pb-2">
            {Icon && <Icon className={`${iconColor} h-7 w-7`} />}
            <span className="text-muted-foreground whitespace-nowrap">{selectedResource?.metadata.namespace}</span>
            <span className="text-muted-foreground mx-1">·</span>
            {selectedResource?.metadata.name}

            {selectedResource && (
              <SystemBadge 
                blockUri={selectedResource.objUri} 
                className="mb-2 ml-6" 
                
              />
            )}
          </SheetTitle>
        </SheetHeader>
        
        {selectedResource && <Timeline events={Object.values(eventsPerObject[selectedResource.objUri])} />}
        
        <SheetFooter>
          {selectedResourceType && selectedResource &&
            <div className="flex gap-2">
              <Button onClick={() => openEditWizard({
                resourceType: selectedResourceType,
                resource: selectedResource,
              })}>Edit</Button>
              <Button className="bg-destructive text-destructive-foreground" onClick={() => setIsDeleteOpen(true)}>Delete</Button>
              <DeleteResourceDialog
                resource={selectedResource}
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
              />
            </div>
          }
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// function Temp() {
//   return         <div className="mt-4 space-y-4 flex flex-col overflow-hidden">
//   <div>
//     <h1 className="text-sm font-medium text-gray-500">Type</h1>
//     <p className="mt-1 text-sm">
//       {selectedResourceType?.group}/{selectedResourceType?.version}.{selectedResourceType?.kind}
//     </p>
//   </div>
//   <div>
//     <h2 className="text-sm font-medium text-gray-500">Status</h2>
//     <div className="mt-1 flex items-center">
//       <StatusBadge readyCondition={readyCondition} />
//       <span className="ml-2 text-sm capitalize">{readyCondition?.message}</span>
//     </div>
//   </div>
//   {Object.keys(properties).length > 0 && (
//     <div>
//       <h2 className="text-sm font-medium text-gray-500">Properties</h2>
//       <dl className="mt-1 text-sm">
//         {Object.entries(properties).map(([key, value]) => (
//           <div key={key} className="flex justify-between">
//             <dt className="font-mono">{key}</dt>
//             <dd className="font-mono">{value}</dd>
//           </div>
//         ))}
//       </dl>
//     </div>
//   )}
//   {Object.keys(outputs).length > 0 && (
//     <div>
//       <h2 className="text-sm font-medium text-gray-500">Outputs</h2>
//       <dl className="mt-1 text-sm">
//         {Object.entries(outputs).map(([key, value]) => (
//           <div key={key} className="flex justify-between">
//             <dt className="font-mono">{key}</dt>
//             <dd className="font-mono">{value}</dd>
//           </div>
//         ))}
//       </dl>
//     </div>
//   )}
//   <h2 className="text-sm font-medium text-gray-500">Logs</h2>
//   {/* scrollable logs container */}
//   <div className="border rounded-md flex-grow h-lvh overflow-hidden">
//     <div className="h-full overflow-auto bg-gray-900">
//       <div ref={logContainerRef} className="h-full w-full bg-gray-900 text-gray-200 overflow-auto">
//         <pre className="text-xs font-extralight font-mono whitespace-pre p-4 pb-10">
//           {finalLogs?.map((p, idx) => (
//             <div key={idx} className="flex gap-2">
//               <span className="text-gray-500">{p.timestamp.toISOString()}</span>
//               <span className={renderLevel(p.level)?.color}>{renderLevel(p.level)?.text}</span>
//               <span className="text-white">{p.message}</span>
//             </div>
//           ))}
//         </pre>
//       </div>
//     </div>
//   </div>
// </div>

// }

function renderLevel(level: any) {
  switch (level) {
    case 0:
      return { text: "DEBUG", color: "text-gray-500" };
    case 1:
      return { text: "INFO ", color: "text-blue-500" };
    case 4:
      return { text: "ERROR", color: "text-red-500" };
    case 3:
      return { text: "WARN ", color: "text-yellow-500" };
  }
}

function addProperty(target: Record<string, string>, value: any, keyPrefix: string[] = []) {
  if (value === undefined) {
    return;
  }
  if (Array.isArray(value)) {
    target[keyPrefix.join(".")] = value.join(", ");
  } else if (typeof value === "object" && value !== null) {
    for (const [k, v] of Object.entries(value)) {
      addProperty(target, v, [...keyPrefix, k]);
    }
  } else {
    target[keyPrefix.join(".")] = value;
  }
}
