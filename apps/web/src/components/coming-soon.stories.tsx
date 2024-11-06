import type { Meta, StoryObj } from "@storybook/react";
import { ComingSoon } from "./coming-soon";

const meta = {
  title: "Components/ComingSoon",
  component: ComingSoon,
  tags: ["autodocs"],
} satisfies Meta<typeof ComingSoon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
