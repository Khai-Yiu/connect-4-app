import { Meta, StoryObj } from '@storybook/react';
import { GameOverview } from '@/connect-4-ui/GameOverview';
import { RoundProps } from '@/connect-4-ui/Round';
import { PlayerRoundOverviewsProps } from '@/connect-4-ui/PlayerRoundOverviews';
import { GameStatus } from '@/connect-4-domain/game-types';

const meta: Meta<typeof GameOverview> = {
    component: GameOverview
};

export default meta;

type Story = StoryObj<typeof GameOverview>;

const round: RoundProps = {
    roundNumber: 1
};

const playerOverview: PlayerRoundOverviewsProps = {
    playerOne: {
        player: 1,
        isActiveTurn: true,
        remainingDiscs: 10,
        discColour: 'red'
    },
    playerTwo: {
        player: 2,
        isActiveTurn: false,
        remainingDiscs: 10,
        discColour: 'red'
    }
};

export const TheOneWithPlayerOneActive: Story = {
    render: () => (
        <GameOverview
            round={round}
            playerRoundOverviews={playerOverview}
            status={GameStatus.IN_PROGRESS}
        />
    )
};

export const TheOneWithPlayerTwoActive: Story = {
    render: () => (
        <GameOverview
            round={round}
            playerRoundOverviews={{
                playerOne: { ...playerOverview.playerOne, isActiveTurn: false },
                playerTwo: { ...playerOverview.playerTwo, isActiveTurn: true }
            }}
            status={GameStatus.IN_PROGRESS}
        />
    )
};

export const TheOneWithPlayerOneWinning: Story = {
    render: () => (
        <GameOverview
            round={round}
            playerRoundOverviews={playerOverview}
            status={GameStatus.PLAYER_ONE_WIN}
        />
    )
};

export const TheOneWithPlayerTwoWinning: Story = {
    render: () => (
        <GameOverview
            round={round}
            playerRoundOverviews={playerOverview}
            status={GameStatus.PLAYER_TWO_WIN}
        />
    )
};

export const TheOneWithADraw: Story = {
    render: () => (
        <GameOverview
            round={round}
            playerRoundOverviews={playerOverview}
            status={GameStatus.DRAW}
        />
    )
};
