import { createMovePlayerCommand } from '@/connect-4-domain/commands';
import { EventTypes, PlayerMoveFailedEvent } from '@/connect-4-domain/events';
import GameFactory from '@/connect-4-domain/game';
import {
    BoardCell as DomainBoardCell,
    GameUuid
} from '@/connect-4-domain/game-types';
import { BoardCell } from '@/connect-4-ui/BoardCell';
import { GameStatus } from '@/connect-4-domain/game-types';

type MoveResult = {
    isSuccess: boolean;
    error?: Array<string>;
};

type BoardCell = {
    player?: Player;
    handlePlayerMove: (player: Player) => MoveResult;
};

type Player = 1 | 2;

export interface GameApi {
    getActivePlayer: () => Player;
    getRemainingDiscs: (player: Player) => number;
    getStatus: () => GameStatus;
    getBoard: () => Array<Array<BoardCell>>;
    saveGame: () => Promise<GameUuid>;
    loadGame: (id: GameUuid) => Promise<void>;
    deleteGame: (id: GameUuid) => Promise<void>;
    resetGame: () => void;
}

const createRowMapper =
    (game: GameFactory) =>
    (row: Array<DomainBoardCell>, rowIndex: number): Array<BoardCell> => {
        const cellMapper = (
            cell: DomainBoardCell,
            columnIndex: number
        ): BoardCell => {
            return {
                player: cell.player,
                handlePlayerMove: (player: Player) => {
                    const movePlayerCommand = createMovePlayerCommand({
                        player,
                        targetCell: {
                            row: rowIndex,
                            column: columnIndex
                        }
                    });
                    const moveEvent = game.move(movePlayerCommand);
                    const isSuccess =
                        moveEvent.type === EventTypes.PLAYER_MOVED;

                    return {
                        isSuccess,
                        error: isSuccess
                            ? undefined
                            : [
                                  (moveEvent as PlayerMoveFailedEvent).payload
                                      .message
                              ]
                    };
                }
            };
        };

        return row.map(cellMapper);
    };

export default function createGameApi(game: GameFactory): GameApi {
    const rowMapper = createRowMapper(game);
    const gameApi = {
        getActivePlayer: game.getActivePlayer,
        getRemainingDiscs: (player: Player) =>
            game.getPlayerStats(player).remainingDiscs,
        getStatus: game.getStatus,
        getBoard: () => game.getBoard().map(rowMapper),
        saveGame: async () => await game.save(),
        loadGame: async (id: GameUuid) => await game.load(id),
        deleteGame: async (id: GameUuid) => await game.delete(id),
        resetGame: () => game.reset()
    };

    return gameApi;
}
