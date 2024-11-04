import type { Meta, StoryObj } from "@storybook/react";

import { TimestampDetails } from "./timestamp-details";

const meta = {
  title: "Components/TimestampDetails",
  component: TimestampDetails,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    timestamp: {
      control: "date",
    },
  },
  args: { timestamp: new Date() },
} satisfies Meta<typeof TimestampDetails>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    timestamp: new Date("2024-01-01T00:00:00.000Z"),
  },
};
