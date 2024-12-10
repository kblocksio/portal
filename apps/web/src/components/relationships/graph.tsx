import { trpc } from "@/trpc";
import type { ObjectHierarchy } from "@kblocks-portal/server";
import { memo, useMemo } from "react";
import { OwnerGraph, OwnerNode } from "./owner-graph";
import { Edge, MarkerType } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { ResourceIcon } from "@/lib/get-icon";

export const RelationshipGraph = memo(function RelationshipGraph({
  objUri,
}: {
  objUri: string;
}) {
  const { data: hierarchy } = trpc.getObjectHierarchy.useQuery({
    objUri,
  });

  const { nodes, edges } = useMemo(() => {
    const nodes: OwnerNode[] = [];
    const edges: Edge[] = [];
    const visited = new Set<string>();

    const addRels = (hierarchy: ObjectHierarchy, big?: boolean) => {
      if (visited.has(hierarchy.objUri)) {
        return;
      }
      visited.add(hierarchy.objUri);

      nodes.push({
        data: {
          name: hierarchy.name,
          description: hierarchy.kind ?? "",
          icon: (
            <div className={cn(big && "p-2")}>
              <ResourceIcon
                icon={hierarchy.icon ?? "Box"}
                className={cn(big ? "size-10" : "size-5")}
              />
            </div>
          ),
          circle: big,
        },
        id: hierarchy.objUri,
        type: "node",
        position: { x: 0, y: 0 },
      });

      for (const child of hierarchy.children) {
        edges.push({
          type: "straight",
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
          id: `${hierarchy.objUri}-${child.objUri}`,
          source: hierarchy.objUri,
          target: child.objUri,
        });

        addRels(child);
      }
    };

    if (hierarchy) {
      addRels(hierarchy, true);
    }
    return { nodes, edges };
  }, [hierarchy]);

  return <>{nodes.length > 0 && <OwnerGraph nodes={nodes} edges={edges} />}</>;
});
