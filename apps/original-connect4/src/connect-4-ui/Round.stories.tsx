import { Meta, StoryObj } from '@storybook/react';
import { Round } from '@/connect-4-ui/Round';

const meta: Meta<typeof Round> = {
    component: Round
};

export default meta;

type Story = StoryObj<typeof Round>;

export const TheOneWithDefaults: Story = {
    render: () => <Round />
};

export const TheOneWithARoundNumber: Story = {
    render: () => <Round roundNumber={5} />
};
