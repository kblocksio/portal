import type { Meta, StoryObj } from "@storybook/react";

import { Edge, Node } from "@xyflow/react";
import { StoryComponent } from "./force-graph";

const initialNodes: Node[] = [
  {
    id: "1",
    type: "mynode",
    data: { label: "root" },
    position: { x: 0, y: 0 },
  },
  {
    id: "10-1",
    type: "mynode",
    data: { label: "ads-service:ecr/ecs/task-definition" },
    position: { x: 0, y: 0 },
  },
  {
    id: "10-2",
    type: "mynode",
    data: { label: "ads-service:ecr/ecs/prod-images" },
    position: { x: 0, y: 0 },
  },
  {
    id: "10",
    type: "mynode",
    data: { label: "gitlab-cr-org/ads" },
    position: { x: 0, y: 0 },
  },
  {
    id: "2",
    type: "mynode",
    data: { label: "node 2" },
    position: { x: 0, y: 100 },
  },
  {
    id: "2a",
    type: "mynode",
    data: { label: "node 2a" },
    position: { x: 0, y: 200 },
  },
  {
    id: "2b",
    type: "mynode",
    data: { label: "node 2b" },
    position: { x: 0, y: 300 },
  },
  {
    id: "2c",
    type: "mynode",
    data: { label: "node 2c" },
    position: { x: 0, y: 400 },
  },
  {
    id: "2d",
    type: "mynode",
    data: { label: "node 2d" },
    position: { x: 0, y: 500 },
  },
  {
    id: "3",
    type: "mynode",
    data: { label: "node 3" },
    position: { x: 200, y: 100 },
  },
];

const initialEdges: Edge[] = [
  { type: "myedge", id: "e12", source: "1", target: "2", animated: true },
  { type: "myedge", id: "e13", source: "1", target: "3", animated: true },
  { type: "myedge", id: "e22a", source: "2", target: "2a", animated: true },
  { type: "myedge", id: "e22b", source: "2", target: "2b", animated: true },
  { type: "myedge", id: "e22c", source: "2", target: "2c", animated: true },
  { type: "myedge", id: "e2c2d", source: "2c", target: "2d", animated: true },
  { type: "myedge", id: "e10-1", source: "10", target: "10-1", animated: true },
  { type: "myedge", id: "e10-2", source: "10", target: "10-2", animated: true },
  {
    type: "myedge",
    id: "einput10-1",
    source: "1",
    target: "10",
    animated: true,
  },
];

const meta = {
  title: "Components/ForceGraph",
  component: StoryComponent,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof StoryComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    nodes: initialNodes,
    edges: initialEdges,
  },
};
