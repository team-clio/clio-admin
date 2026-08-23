import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProjectCreationPage } from "./ProjectCreationPage";

const meta = {
  title: "Pages/ProjectCreationPage",
  component: ProjectCreationPage,
  parameters: { layout: "fullscreen" },
  args: {
    onCancel: () => undefined,
    onDirtyChange: () => undefined,
    onCreateProject: async (input) => ({
      id: 3,
      name: input.name,
      description: input.description ?? null,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    onProjectCreated: () => undefined,
    onFinish: () => undefined,
    onOpenSettings: () => undefined,
  },
} satisfies Meta<typeof ProjectCreationPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
