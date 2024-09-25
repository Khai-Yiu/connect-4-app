import { Meta, StoryObj } from '@storybook/react';
import { Status } from '@/connect-4-ui/Status';
import { GameStatus } from '@/connect-4-domain/game-types';

const meta: Meta<typeof Status> = {
    component: Status
};

export default meta;

type Story = StoryObj<typeof Status>;

export const TheOneWithDefaults: Story = {
    render: () => <Status status={GameStatus.IN_PROGRESS} />
};

export const TheOneWithPlayerOneWinning: Story = {
    render: () => <Status status={GameStatus.PLAYER_ONE_WIN} />
};

export const TheOneWithPlayerTwoWinning: Story = {
    render: () => <Status status={GameStatus.PLAYER_TWO_WIN} />
};

export const TheOneWithATie: Story = {
    render: () => <Status status={GameStatus.DRAW} />
};
