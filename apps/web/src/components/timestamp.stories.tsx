import type { Meta, StoryObj } from "@storybook/react";

import { Timestamp } from "./timestamp";

const meta = {
  title: "Components/Timestamp",
  component: Timestamp,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="p-24">
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
  argTypes: {
    timestamp: {
      control: "date",
    },
  },
  args: { timestamp: new Date() },
} satisfies Meta<typeof Timestamp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    timestamp: new Date("2024-01-01T00:00:00.000Z"),
  },
};
