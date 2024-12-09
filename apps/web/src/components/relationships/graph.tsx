import type { ExtendedResourceType } from "@/hooks/use-resource-types";
import { memo } from "react";
// import { Box } from "lucide-react";
// import { OwnerGraph, OwnerNode } from "./owner-graph";
// import { Edge, MarkerType } from "@xyflow/react";
// import { cn } from "@/lib/utils";

export const RelationshipGraph = memo(function RelationshipGraph({
  selectedResource,
}: {
  selectedResource?: ExtendedResourceType;
}) {
  return <pre>to do: {selectedResource?.kind}</pre>;
  // const { relationships, objects, resourceTypes } = useContext(ResourceContext);

  // const { nodes, edges } = useMemo(() => {
  //   const nodes: OwnerNode[] = [];
  //   const edges: Edge[] = [];
  //   const visited = new Set<string>();

  //   const addRels = (srcUri: string, big?: boolean) => {
  //     if (visited.has(srcUri)) {
  //       return;
  //     }
  //     visited.add(srcUri);

  //     const obj = objects[srcUri];
  //     const type = resourceTypes[obj.objType];
  //     const Icon = type?.iconComponent ?? Box;
  //     nodes.push({
  //       data: {
  //         name: obj.metadata.name,
  //         description: type?.kind,
  //         icon: (
  //           <div className={cn(big && "p-2")}>
  //             <Icon className={cn(big ? "size-10" : "size-5")} />
  //           </div>
  //         ),
  //         circle: big,
  //       },
  //       id: srcUri,
  //       type: "node",
  //       position: { x: 0, y: 0 },
  //     });

  //     for (const [targetUri, rel] of Object.entries(
  //       relationships[srcUri] ?? {},
  //     )) {
  //       if (rel.type === "parent") {
  //         continue;
  //       }

  //       edges.push({
  //         type: "straight",
  //         markerEnd: {
  //           type: MarkerType.ArrowClosed,
  //         },
  //         id: `${srcUri}-${targetUri}`,
  //         source: srcUri,
  //         target: targetUri,
  //       });

  //       addRels(targetUri);
  //     }
  //   };

  //   if (selectedResource) {
  //     addRels(selectedResource.objUri, true);
  //   } else {
  //     for (const objUri of Object.keys(objects)) {
  //       addRels(objUri);
  //     }
  //   }
  //   return { nodes, edges };
  // }, [selectedResource, objects, resourceTypes, relationships]);

  // return <OwnerGraph nodes={nodes} edges={edges} />;
});
