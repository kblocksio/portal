import type { Meta, StoryObj } from "@storybook/react";
import { userEvent, waitFor, within, expect } from "@storybook/test";

import { Timestamp } from "./timestamp";

const meta = {
  title: "Components/Timestamp",
  component: Timestamp,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="pt-24">
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const element = canvas.getByRole("time");

    await userEvent.hover(element);

    await waitFor(() => {
      expect(canvas.getByRole("tooltip")).toBeVisible();
    });
  },
};
