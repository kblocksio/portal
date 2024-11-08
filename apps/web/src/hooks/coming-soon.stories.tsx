import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import { ComingSoon } from "@/components/coming-soon";

const meta = {
  title: "Components/Comming Soon",
  component: ComingSoon,
  tags: ["autodocs"],
} satisfies Meta<typeof ComingSoon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ height: "100vh", width: "100vw" }}>
      <ComingSoon />
    </div>
  ),
};
