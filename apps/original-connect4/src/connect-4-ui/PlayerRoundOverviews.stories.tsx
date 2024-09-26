import { Meta, StoryObj } from '@storybook/react';
import { PlayerRoundOverviews } from '@/connect-4-ui/PlayerRoundOverviews';
import { PlayerRoundOverviewProps } from '@/connect-4-ui/PlayerRoundOverview';

const meta: Meta<typeof PlayerRoundOverviews> = {
    component: PlayerRoundOverviews
};

export default meta;

type Story = StoryObj<typeof PlayerRoundOverviews>;

const playerOne: PlayerRoundOverviewProps = {
    player: 1,
    isActiveTurn: true,
    remainingDiscs: 10,
    discColour: 'red'
};

const playerTwo: PlayerRoundOverviewProps = {
    player: 2,
    isActiveTurn: false,
    remainingDiscs: 10,
    discColour: 'red'
};

export const TheOneWherePlayerOneIsActive: Story = {
    render: () => (
        <PlayerRoundOverviews
            playerOne={{ ...playerOne }}
            playerTwo={{ ...playerTwo }}
        />
    )
};

export const TheOneWherePlayerTwoIsActive: Story = {
    render: () => (
        <PlayerRoundOverviews
            playerOne={{ ...playerOne, isActiveTurn: false }}
            playerTwo={{ ...playerTwo, isActiveTurn: true }}
        />
    )
};
