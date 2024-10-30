import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Box } from "lucide-react";
import { ResourceTypeCard } from "./resource-card";

const meta = {
  title: "Components/Resource Catalog/Resource Card",
  component: ResourceTypeCard,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    resource: {
      control: "select",
      options: ["default"],
    },
  },
} satisfies Meta<typeof ResourceTypeCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    resource: {
      description: "A bucket is a container for objects stored in Google Cloud Storage.",
      kind: "Bucket",
      group: "storage",
      version: "v1",
      iconComponent: Box,
      plural: "buckets",
    },
    handleResourceSelect: fn(),
    handleDocsOpen: fn(),
  },
};
