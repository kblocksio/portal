import "@xyflow/react/dist/style.css";
import { useEffect, useState } from "react";
import * as d3 from "d3-force";
import {
  ReactFlow,
  ReactFlowProvider,
  Panel,
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
  MiniMap,
  Controls,
} from "@xyflow/react";

import type { Edge, Node } from "@xyflow/react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

const MyNode = (props: NodeProps) => {
  return (
    <div className={cn("relative size-8 rounded-full bg-blue-200 shadow-md")}>
      <div className="absolute inset-0 flex items-center justify-around">
        <div className="truncate text-xs">{props.id}</div>
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

type NodeDatum = d3.SimulationNodeDatum & Node;

const ForceGraph = (props: { nodes: Node[]; edges: Edge[] }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(props.nodes);
  const [edges, , onEdgesChange] = useEdgesState(props.edges);

  const { getNodes, getEdges, fitView } = useReactFlow();
  const initialized = useNodesInitialized();

  useEffect(() => {
    const nodeDatums = getNodes().map<NodeDatum>((node) => ({
      ...node,
      x: node.position.x,
      y: node.position.y,
    }));
    const edgeDatums = getEdges().map((edge) => edge);

    // If React Flow hasn't initialized our nodes with a width and height yet, or
    // if there are no nodes in the flow, then we can't run the simulation!
    if (!initialized || nodeDatums.length === 0) return;

    const simulation = d3
      .forceSimulation<NodeDatum>()
      .force("charge", d3.forceManyBody().strength(-400))
      .force(
        "collide",
        d3.forceCollide<NodeDatum>().radius((d) => {
          return Math.max(d.measured?.width ?? 0, d.measured?.height ?? 0);
        }),
      )
      .stop();

    simulation.nodes(nodeDatums).force(
      "link",
      d3
        .forceLink(edgeDatums)
        .id((d) => d.id)
        .strength((d) => {
          // console.log(d);
          return d.source.id === "1" ? 0.35 : 1;
        }),
    );

    simulation.tick(
      Math.ceil(
        Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay()),
      ),
    );
    setNodes(
      nodeDatums.map((node) => ({
        ...node,
        position: { x: node.x, y: node.y },
      })),
    );
    requestAnimationFrame(() => {
      fitView();
    });

    // requestAnimationFrame(() => {
    //   debugger;
    //   fitView();
    //   debugger;
    // });

    // window.addEventListener("load", () => {
    //   requestAnimationFrame(() => {
    //     fitView();
    //   });
    // });
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
        nodeTypes={{ mynode: MyNode }}
        edgeTypes={{ myedge: StraightEdge }}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
      >
        <Background />
        <Controls showInteractive={false} />
        <MiniMap pannable zoomable />
        {/* <Panel>
          <Button onClick={() => fitView()}>Fit View</Button>
        </Panel> */}
      </ReactFlow>
    </div>
  );
};

export const StoryComponent = (props: { nodes: Node[]; edges: Edge[] }) => (
  <div className="size-[48rem]">
    <ReactFlowProvider>
      <ForceGraph nodes={props.nodes} edges={props.edges} />
    </ReactFlowProvider>
  </div>
);
