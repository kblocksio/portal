import { useEffect, useState } from "react";
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
  EdgeProps,
  // BaseEdge,
  // getStraightPath,
  StraightEdge,
  Background,
  Controls,
} from "@xyflow/react";
import type {
  Edge as ReactFlowEdge,
  Node as ReactFlowNode,
} from "@xyflow/react";
import { cn } from "@/lib/utils";

import "@xyflow/react/dist/style.css";

export type OwnerNodeData = {
  // id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  size: "big" | "small";
};

export type OwnerNode = ReactFlowNode<OwnerNodeData, "node">;

const OwnerNode = (props: NodeProps<OwnerNode>) => {
  return (
    <div
      className={cn(
        "relative rounded-full bg-blue-200 shadow-md",
        props.data.size === "big" && "size-16",
        props.data.size === "small" && "size-8",
      )}
    >
      <div className="absolute inset-0 flex items-center justify-around">
        {props.data.icon}
      </div>

      <div className="absolute inset-x-0 bottom-0">
        <div className="relative">
          <div className="absolute inset-x-0 top-0 flex flex-col items-center">
            <div className="whitespace-nowrap text-sm">{props.data.name}</div>
            <div className="text-muted-foreground whitespace-nowrap text-xs">
              {props.data.description}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-around">
        <div className="relative">
          <Handle
            type="target"
            position={Position.Top}
            style={{ visibility: "hidden" }}
          />
          <Handle
            type="target"
            position={Position.Bottom}
            style={{ visibility: "hidden" }}
          />
          <Handle
            type="target"
            position={Position.Right}
            style={{ visibility: "hidden" }}
          />
          <Handle
            type="target"
            position={Position.Left}
            style={{ visibility: "hidden" }}
          />

          <Handle
            type="source"
            position={Position.Top}
            style={{ visibility: "hidden" }}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            style={{ visibility: "hidden" }}
          />
          <Handle
            type="source"
            position={Position.Right}
            style={{ visibility: "hidden" }}
          />
          <Handle
            type="source"
            position={Position.Left}
            style={{ visibility: "hidden" }}
          />
        </div>
      </div>
    </div>
  );
};

const nodeTypes = { node: OwnerNode };

const edgeTypes = { straight: StraightEdge };

type NodeDatum = {
  id: string;
  x: number;
  y: number;
  reactFlowNode: OwnerNode;
};

type EdgeDatum = ReactFlowEdge;

const OwnerFlow = (props: { nodes: OwnerNode[]; edges: ReactFlowEdge[] }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(props.nodes);
  const [edges, , onEdgesChange] = useEdgesState(props.edges);

  const { getNodes, getEdges, fitView } = useReactFlow<
    OwnerNode,
    ReactFlowEdge
  >();
  const initialized = useNodesInitialized();

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
      .forceSimulation<NodeDatum>()
      .force("charge", d3.forceManyBody().strength(-2000))
      .force(
        "collide",
        d3.forceCollide<NodeDatum>().radius((d) => {
          return Math.max(
            d.reactFlowNode.measured?.width ?? 0,
            d.reactFlowNode.measured?.height ?? 0,
          );
        }),
      )
      .stop();

    simulation.nodes(nodeDatums).force(
      "link",
      d3
        .forceLink<NodeDatum, EdgeDatum>(edgeDatums)
        .id((d) => d.id)
        .strength((d) => {
          // console.log(d);
          return d.source.id === "1" ? 0.295 : 0.5;
        }),
    );

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
    requestAnimationFrame(() => {
      fitView();
    });
  }, [initialized, getNodes, getEdges, setNodes, fitView]);

  useEffect(() => {
    requestAnimationFrame(() => {
      fitView();
    });
  }, [fitView, nodes]);

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
      >
        <Background />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
};

export const StoryComponent = (props: {
  nodes: OwnerNode[];
  edges: ReactFlowEdge[];
}) => (
  <div className="size-[48rem]">
    <ReactFlowProvider>
      <OwnerFlow nodes={props.nodes} edges={props.edges} />
    </ReactFlowProvider>
  </div>
);
