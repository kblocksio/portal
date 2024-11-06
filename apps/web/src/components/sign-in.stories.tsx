import type { Meta, StoryObj } from "@storybook/react";
import { SignIn } from "./sign-in";

const meta = {
  title: "Components/SignIn",
  component: SignIn,
  tags: ["autodocs"],
} satisfies Meta<typeof SignIn>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
