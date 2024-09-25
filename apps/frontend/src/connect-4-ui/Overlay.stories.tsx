import { Meta, StoryObj } from '@storybook/react';
import Overlay from '@/connect-4-ui/Overlay';

const meta: Meta<typeof Overlay> = {
    component: Overlay
};

export default meta;

type Story = StoryObj<typeof Overlay>;

export const TheOneWithDefaults: Story = {
    render: () => <Overlay />
};

export const TheOneWithAComponent: Story = {
    render: () => (
        <Overlay
            componentSpec={{
                Component: ({ name }: { name: string }) => <div>{name}</div>,
                props: {
                    name: 'Lord Dempstar'
                }
            }}
        />
    )
};
