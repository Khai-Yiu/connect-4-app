import { Meta, StoryObj } from '@storybook/react';
import { BoardCell } from '@/connect-4-ui/BoardCell';
import { action } from '@storybook/addon-actions';

const meta: Meta<typeof BoardCell> = {
    component: BoardCell,
    decorators: [
        (Story) => (
            <div style={{ width: '100px', height: '100px' }}>
                <Story />
            </div>
        )
    ]
};

export default meta;

type Story = StoryObj<typeof BoardCell>;

export const TheOneWithDefaults: Story = {
    render: () => <BoardCell />
};

export const TheOneWithPlayer1: Story = {
    render: () => <BoardCell player={1} />
};

export const TheOneWithPlayer2: Story = {
    render: () => <BoardCell player={2} />
};

export const TheOneWithAClickHandler: Story = {
    render: () => <BoardCell onClick={action('Clicked cell')} />
};
