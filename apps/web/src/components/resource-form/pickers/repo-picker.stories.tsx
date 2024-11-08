import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import { RepoPicker } from "./repo-picker";

const meta = {
  title: "Components/RepoPicker",
  component: RepoPicker,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof RepoPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    handleOnSelection: fn(),
    fieldName: "repo",
  },
};
