import { memo, useContext, useMemo } from "react";
import { Box } from "lucide-react";
import { OwnerGraph, OwnerNode } from "./owner-graph";
import {
  RelationshipType,
  Resource,
  ResourceContext,
} from "@/resource-context";
import { Edge, MarkerType } from "@xyflow/react";

export const RelationshipGraph = memo(function RelationshipGraph({
  selectedResource,
}: {
  selectedResource?: Resource;
}) {
  const { relationships, objects, resourceTypes } = useContext(ResourceContext);

  const { nodes, edges } = useMemo(() => {
    const nodes: OwnerNode[] = [];
    const edges: Edge[] = [];
    const visited = new Set<string>();

    const addRels = (srcUri: string) => {
      if (visited.has(srcUri)) {
        return;
      }
      visited.add(srcUri);

      const obj = objects[srcUri];
      const type = resourceTypes[obj.objType];
      const Icon = type?.iconComponent ?? Box;
      nodes.push({
        data: {
          name: obj.metadata.name,
          description: type?.kind,
          icon: <Icon className="size-5" />,
        },
        id: srcUri,
        type: "node",
        position: { x: 0, y: 0 },
      });

      for (const [targetUri, rel] of Object.entries(
        relationships[srcUri] ?? {},
      )) {
        if (rel.type === RelationshipType.PARENT) {
          continue;
        }

        edges.push({
          type: "straight",
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
          id: `${srcUri}-${targetUri}`,
          source: srcUri,
          target: targetUri,
        });

        addRels(targetUri);
      }
    };

    if (selectedResource) {
      addRels(selectedResource.objUri);
    } else {
      for (const objUri of Object.keys(objects)) {
        addRels(objUri);
      }
    }
    return { nodes, edges };
  }, [selectedResource, objects, resourceTypes, relationships]);

  return <OwnerGraph nodes={nodes} edges={edges} />;
});
