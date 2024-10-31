import { useContext, useMemo } from "react";
import { Box } from "lucide-react";
import { OwnerGraph, OwnerNode } from "@/components/relationships/owner-graph";
import { Resource, ResourceContext } from "@/resource-context";
import { Edge, MarkerType } from "@xyflow/react";

export const RelationshipGraph = ({ selectedResource }: { selectedResource?: Resource }) => {
  const { relationships } = useContext(ResourceContext);

  const { nodes, edges } = useMemo(() => {
    const nodes: OwnerNode[] = [];
    const edges: Edge[] = [];

    for (const [srcUri, rels] of Object.entries(relationships)) {
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

      for (const [targetUri, rel] of Object.entries(rels)) {
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
      }
    }
    return { nodes, edges };
  }, [relationships])

  return (
    <OwnerGraph nodes={nodes} edges={edges} />
  );
};
