import { Meta, StoryObj } from '@storybook/react';
import { GameplayArea } from '@/connect-4-ui/GameplayArea';
import createCells from '@/connect-4-ui/create-cells';
import { GameOverviewProps } from '@/connect-4-ui/GameOverview';
import { BoardProps } from '@/connect-4-ui/Board';
import { action } from '@storybook/addon-actions';
import { GameStatus } from '@/connect-4-domain/game-types';

const meta: Meta<typeof GameplayArea> = {
    component: GameplayArea
};

export default meta;

type Story = StoryObj<typeof GameplayArea>;

const gameOverview: GameOverviewProps = {
    round: {
        roundNumber: 1
    },
    playerRoundOverviews: {
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
    },
    status: GameStatus.IN_PROGRESS
};

const gameplayAreaProps = {
    onStartGameClick: () => {},
    onResetGameClick: () => {},
    onSaveGameClick: () => {},
    onLoadGameClick: () => {}
};

const board: BoardProps = {
    cells: createCells(6, 7)
};

const activeGame = {
    gameOverview: gameOverview,
    board: board
};

export const TheOneWithDefaults: Story = {
    render: () => <GameplayArea {...gameplayAreaProps} />
};

export const TheOneWithAGameInProgress: Story = {
    render: () => (
        <GameplayArea activeGame={activeGame} {...gameplayAreaProps} />
    )
};

export const TheOneWithAStartGameClickHandler: Story = {
    render: () => (
        <GameplayArea
            {...gameplayAreaProps}
            onStartGameClick={action('Start game.')}
        />
    )
};
