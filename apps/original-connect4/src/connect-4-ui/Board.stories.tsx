import { Meta, StoryObj } from '@storybook/react';
import { Board } from '@/connect-4-ui/Board';
import createCells from '@/connect-4-ui/create-cells';
import { action } from '@storybook/addon-actions';

const meta: Meta<typeof Board> = {
    component: Board
};

export default meta;

const randomCellStrategy = (): 1 | 2 | undefined => {
    let randNum = Math.floor(Math.random() * 3);

    return randNum === 0 ? undefined : (randNum as 1 | 2);
};

type Story = StoryObj<typeof Board>;

export const TheOneWithDefaults: Story = {
    render: () => <Board />
};

export const TheOneWithPlayer1: Story = {
    render: () => <Board cells={createCells(6, 7, () => 1)} />
};

export const TheOneWithPlayer2: Story = {
    render: () => <Board cells={createCells(6, 7, () => 2)} />
};

export const TheOneWithRandomTokens: Story = {
    render: () => <Board cells={createCells(6, 7, randomCellStrategy)} />
};

export const TheOneWithAClickHandler: Story = {
    render: () => <Board onClick={action('Clicked cell')} />
};
