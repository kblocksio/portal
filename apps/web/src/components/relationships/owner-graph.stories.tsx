import type { Meta, StoryObj } from "@storybook/react";

import { OwnerGraph } from "./owner-graph";

const meta = {
  title: "Components/ForceGraph",
  component: OwnerGraph,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof OwnerGraph>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    nodes: [
      {
        id: "1", // unique identifier
        type: "node", // must be "node" so it renders correctly
        data: {
          name: "root", // name of the node
          description: "root node", // description of the node
          icon: <div className="text-sm">🌲</div>, // icon of the node
        },
        position: { x: 0, y: 0 }, // must be present
      },
      {
        id: "10-1",
        type: "node",
        data: {
          name: "ads-service:ecr/ecs/task-definition",
          description: "task definition",
          icon: <div className="text-sm">🐳</div>,
        },
        position: { x: 0, y: 0 },
      },
      {
        id: "10-2",
        type: "node",
        data: {
          name: "ads-service:ecr/ecs/prod-images",
          description: "prod images",
          icon: <div className="text-sm">🐳</div>,
        },
        position: { x: 0, y: 0 },
      },
      {
        id: "10",
        type: "node",
        data: {
          name: "gitlab-cr-org/ads",
          description: "ads repo",
          icon: <div className="text-sm">🐳</div>,
        },
        position: { x: 0, y: 0 },
      },
      {
        id: "2",
        type: "node",
        data: {
          name: "node 2",
          description: "node 2",
          icon: <div className="text-sm">🐳</div>,
        },
        position: { x: 0, y: 0 },
      },
      {
        id: "2a",
        type: "node",
        data: {
          name: "node 2a",
          description: "node 2a",
          icon: <div className="text-sm">🐳</div>,
        },
        position: { x: 0, y: 0 },
      },
      {
        id: "2b",
        type: "node",
        data: {
          name: "node 2b",
          description: "node 2b",
          icon: <div className="text-sm">🐳</div>,
        },
        position: { x: 0, y: 0 },
      },
      {
        id: "2c",
        type: "node",
        data: {
          name: "node 2c",
          description: "node 2c",
          icon: <div className="text-sm">🐳</div>,
        },
        position: { x: 0, y: 0 },
      },
      {
        id: "2d",
        type: "node",
        data: {
          name: "node 2d",
          description: "node 2d",
          icon: <div className="text-sm">🐳</div>,
        },
        position: { x: 0, y: 0 },
      },
      {
        id: "3",
        type: "node",
        data: {
          name: "node 3",
          description: "node 3",
          icon: <div className="text-sm">🐳</div>,
        },
        position: { x: 0, y: 0 },
      },
    ],
    edges: [
      {
        type: "straight", // required
        id: "e12", // unique identifier for the edge
        source: "1", // id of the source node
        target: "2", // id of the target node
        animated: true, // optional, changes the edge appearance
      },
      { type: "straight", id: "e13", source: "1", target: "3", animated: true },
      {
        type: "straight",
        id: "e22a",
        source: "2",
        target: "2a",
        animated: true,
      },
      {
        type: "straight",
        id: "e22b",
        source: "2",
        target: "2b",
        animated: true,
      },
      {
        type: "straight",
        id: "e22c",
        source: "2",
        target: "2c",
        animated: true,
      },
      {
        type: "straight",
        id: "e2c2d",
        source: "2c",
        target: "2d",
        animated: true,
      },
      {
        type: "straight",
        id: "e10-1",
        source: "10",
        target: "10-1",
        animated: true,
      },
      {
        type: "straight",
        id: "e10-2",
        source: "10",
        target: "10-2",
        animated: true,
      },
      {
        type: "straight",
        id: "einput10-1",
        source: "1",
        target: "10",
        animated: true,
      },
    ],
  },
};
