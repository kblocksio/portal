import { memo, useEffect, useState } from "react";
import * as d3 from "d3-force";
import {
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
  useNodesInitialized,
  NodeProps,
  Handle,
  Position,
  StraightEdge,
  Background,
  Controls,
  useInternalNode,
} from "@xyflow/react";
import type {
  EdgeProps,
  Edge as ReactFlowEdge,
  Node as ReactFlowNode,
} from "@xyflow/react";
import { cn } from "@/lib/utils";

import "@xyflow/react/dist/style.css";
import { getConnectingLineWithoutCrossing } from "./math";

export type OwnerNodeData = {
  name: string;
  description: string;
  icon: React.ReactNode;
};

export type OwnerNode = ReactFlowNode<OwnerNodeData, "node">;

const OwnerNode = memo(function OwnerNode(props: NodeProps<OwnerNode>) {
  return (
    <div className="relative">
      <div className="bg-background rounded border p-3 shadow-md">
        {props.data.icon}

        <Handle
          type="target"
          position={Position.Top}
          style={{ visibility: "hidden" }}
        />

        <Handle
          type="source"
          position={Position.Top}
          style={{ visibility: "hidden" }}
        />
      </div>

      <div className="absolute inset-x-0 mt-2">
        <div className="flex flex-col items-center">
          <div className="hover:bg-background/80 flex flex-col items-center">
            <div className="max-w-64 truncate text-sm">{props.data.name}</div>
            <div className="text-muted-foreground max-w-xs truncate text-xs">
              {props.data.description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const nodeTypes = { node: OwnerNode };

const CustomEdge = memo(function CustomEdge(props: EdgeProps) {
  const sourceNode = useInternalNode(props.source);
  const targetNode = useInternalNode(props.target);
  const sourceSize = {
    width: sourceNode!.measured?.width ?? 32,
    height: sourceNode!.measured?.height ?? 32,
  };
  const targetSize = {
    width: targetNode!.measured?.width ?? 32,
    height: targetNode!.measured?.height ?? 32,
  };
  const source = {
    x: sourceNode!.position.x + sourceSize.width / 2,
    y: sourceNode!.position.y + sourceSize.height / 2,
  };
  const target = {
    x: targetNode!.position.x + targetSize.width / 2,
    y: targetNode!.position.y + targetSize.height / 2,
  };

  const { start, end } = getConnectingLineWithoutCrossing(
    source,
    sourceSize,
    target,
    targetSize,
  );

  return (
    <StraightEdge
      {...props}
      sourceX={start.x}
      sourceY={start.y}
      targetX={end.x}
      targetY={end.y}
    />
  );
});

const edgeTypes = { straight: CustomEdge };

type NodeDatum = {
  id: string;
  x: number;
  y: number;
  reactFlowNode: OwnerNode;
};

type EdgeDatum = ReactFlowEdge;

const OwnerFlow = memo(function OwnerFlow(props: {
  nodes: OwnerNode[];
  edges: ReactFlowEdge[];
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState(props.nodes);
  const [edges, , onEdgesChange] = useEdgesState(props.edges);

  const { getNodes, getEdges, fitView } = useReactFlow<
    OwnerNode,
    ReactFlowEdge
  >();
  const initialized = useNodesInitialized();

  const [simulationDone, setSimulationDone] = useState(false);

  useEffect(() => {
    const nodeDatums = getNodes().map<NodeDatum>((node) => ({
      id: node.id,
      x: node.position.x,
      y: node.position.y,
      reactFlowNode: node,
    }));
    const edgeDatums = getEdges().map((edge) => edge);

    // If React Flow hasn't initialized our nodes with a width and height yet, or
    // if there are no nodes in the flow, then we can't run the simulation!
    if (!initialized || nodeDatums.length === 0) return;

    const simulation = d3
      .forceSimulation(nodeDatums)
      .force("charge", d3.forceManyBody().strength(-300))
      .force(
        "link",
        d3
          .forceLink<NodeDatum, EdgeDatum>(edgeDatums)
          .id((d) => d.id)
          .distance(256),
      )
      .force(
        "collide",
        d3
          .forceCollide<NodeDatum>()
          .radius((d) => {
            return (
              Math.max(
                d.reactFlowNode.measured?.width ?? 32,
                d.reactFlowNode.measured?.height ?? 32,
              ) * 0.8
            );
          })
          .strength(0.5),
      )
      .stop();

    simulation.tick(
      Math.ceil(
        Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay()),
      ),
    );
    setNodes(
      nodeDatums.map((node) => ({
        // Careful! The `...` seems to be necessary to avoid infinite rerenders.
        ...node.reactFlowNode,
        position: { x: node.x ?? 0, y: node.y ?? 0 },
      })),
    );
    setSimulationDone(true);
  }, [initialized, getNodes, getEdges, setNodes, fitView]);

  useEffect(() => {
    if (simulationDone) {
      requestAnimationFrame(() => {
        fitView();
      });
    }
  }, [fitView, simulationDone]);

  return (
    <div
      className={cn(
        "size-full",
        "transition-opacity",
        !initialized && "opacity-0",
      )}
    >
      <ReactFlow
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        maxZoom={1.1}
      >
        <Background />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
});

export const OwnerGraph = memo(function OwnerGraph(props: {
  nodes: OwnerNode[];
  edges: ReactFlowEdge[];
}) {
  return (
    <ReactFlowProvider>
      <OwnerFlow nodes={props.nodes} edges={props.edges} />
    </ReactFlowProvider>
  );
});
