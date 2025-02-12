import type { Meta, StoryObj } from "@storybook/react";
import { Btn } from "./component";

const meta: Meta<typeof Btn> = {
  component: Btn,
};

export default meta;
type Story = StoryObj<typeof Btn>;

export const Default: Story = {
  args: {
    children: "Default",
  },
};
