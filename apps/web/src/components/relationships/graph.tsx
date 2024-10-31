import { useContext, useMemo } from "react";
import { Box } from "lucide-react";
import { OwnerGraph, OwnerNode } from "@/components/relationships/owner-graph";
import { Resource, ResourceContext } from "@/resource-context";
import { Edge, MarkerType } from "@xyflow/react";

export const RelationshipGraph = ({ selectedResource }: { selectedResource?: Resource }) => {
  const { relationships, objects } = useContext(ResourceContext);

  const { nodes, edges } = useMemo(() => {
    const nodes: OwnerNode[] = [];
    const edges: Edge[] = [];
    const visited = new Set<string>();

    const addRels = (srcUri: string) => {
      if (visited.has(srcUri)) {
        return;
      }
      visited.add(srcUri);
      nodes.push({
        data: {
          name: srcUri,
          description: srcUri,
          icon: <Box />
        },
        id: srcUri,
        type: "node",
        position: { x: 0, y: 0 }
      });

      for (const [targetUri, rel] of Object.entries(relationships[srcUri])) {
        edges.push({
          type: "straight",
          label: rel.type,
          markerEnd: {
            type: MarkerType.Arrow,
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
  }, [relationships, selectedResource, objects])

  return (
    <OwnerGraph nodes={nodes} edges={edges} />
  );
};
