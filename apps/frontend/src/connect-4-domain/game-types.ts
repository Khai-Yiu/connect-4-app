import { GameRepository } from './game';

export enum GameStatus {
    IN_PROGRESS = 'IN_PROGRESS',
    PLAYER_ONE_WIN = 'PLAYER_ONE_WIN',
    PLAYER_TWO_WIN = 'PLAYER_TWO_WIN',
    DRAW = 'DRAW'
}

export type BoardCell = {
    player: 1 | 2 | undefined;
};

export type Board = Array<Array<BoardCell>>;

export type PlayerMove = {
    player: 1 | 2;
    targetCell: {
        row: number;
        column: number;
    };
};

export type BoardDimensions = {
    rows: number;
    columns: number;
};

export type PlayerNumber = 1 | 2;

export type PlayerStats = {
    playerNumber: 1 | 2;
    remainingDiscs: number;
};

export type ValidationResult = {
    isValid: boolean;
    message: string;
};

export type ValidCellOnBoard = {
    isValidRow: boolean;
    isValidColumn: boolean;
};

export type PersistedGame = {
    board: Board;
    activePlayer: PlayerNumber;
    playerStats: Record<PlayerNumber, PlayerStats>;
    gameStatus: GameStatus;
};

export type GameUuid = string;

export type GameParameters = {
    boardDimensions?: { rows: number; columns: number };
    repository?: GameRepository;
};
