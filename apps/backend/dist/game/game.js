"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const game_types_d_1 = require("@/game/game-types.d");
const deep_clone_1 = __importDefault(require("@/utils/deep-clone"));
const get_is_winning_move_1 = __importDefault(require("./get-is-winning-move"));
const DEFAULT_BOARD_DIMENSIONS = {
    rows: 6,
    columns: 7
};
class Game {
    uuid;
    board;
    boardDimensions;
    activePlayer;
    playerStats;
    gameStatus;
    constructor({ uuid, board, boardDimensions = DEFAULT_BOARD_DIMENSIONS, activePlayer = 1, playerStats, gameStatus = game_types_d_1.GameStatus.IN_PROGRESS } = {
        uuid: crypto.randomUUID(),
        boardDimensions: DEFAULT_BOARD_DIMENSIONS,
        activePlayer: 1,
        gameStatus: game_types_d_1.GameStatus.IN_PROGRESS
    }) {
        this.uuid = uuid;
        this.board = board ?? this.#createBoard(boardDimensions);
        this.boardDimensions = boardDimensions;
        this.activePlayer = activePlayer;
        this.playerStats =
            playerStats ?? this.#createPlayerStats(boardDimensions);
        this.gameStatus = gameStatus;
    }
    #createBoard = ({ rows, columns }) => new Array(rows).fill(undefined).map(() => new Array(columns).fill(undefined).map(() => ({
        player: undefined
    })));
    #createPlayerStats = ({ rows, columns }) => {
        const remainingDiscs = (rows * columns) / 2;
        return {
            1: {
                playerNumber: 1,
                remainingDiscs
            },
            2: {
                playerNumber: 2,
                remainingDiscs
            }
        };
    };
    getBoard() {
        return (0, deep_clone_1.default)(this.board);
    }
    getDetails() {
        return {
            uuid: this.uuid,
            board: (0, deep_clone_1.default)(this.board),
            boardDimensions: (0, deep_clone_1.default)(this.boardDimensions),
            activePlayer: this.activePlayer,
            playerStats: (0, deep_clone_1.default)(this.playerStats),
            gameStatus: this.gameStatus
        };
    }
    move = this.#createValidatedMove(this.#_move.bind(this));
    #_move({ player, targetCell: { row, column } }) {
        const { isWin } = (0, get_is_winning_move_1.default)(this.getBoard(), {
            player,
            targetCell: { row, column }
        });
        this.board[row][column] = { player: player };
        this.playerStats[this.activePlayer].remainingDiscs--;
        this.activePlayer = this.activePlayer === 2 ? 1 : 2;
        if (isWin) {
            this.gameStatus =
                this.activePlayer === 2
                    ? game_types_d_1.GameStatus.PLAYER_ONE_WON
                    : game_types_d_1.GameStatus.PLAYER_TWO_WON;
        }
        else if (this.playerStats[1].remainingDiscs === 0 &&
            this.playerStats[2].remainingDiscs === 0) {
            this.gameStatus = game_types_d_1.GameStatus.DRAW;
        }
        return {
            moveSuccessful: true
        };
    }
    #createValidatedMove(moveFunction) {
        return (playerMoveDetails) => {
            const { isValid, message } = this.#validateMove(playerMoveDetails);
            return isValid
                ? moveFunction(playerMoveDetails)
                : { moveSuccessful: false, message };
        };
    }
    #validateMove({ player, targetCell: { row, column } }) {
        if (this.gameStatus === 'PLAYER_ONE_WON') {
            return {
                isValid: false,
                message: 'You cannot make a move, player 1 has already won the game'
            };
        }
        else if (this.gameStatus === game_types_d_1.GameStatus.PLAYER_TWO_WON) {
            return {
                isValid: false,
                message: 'You cannot make a move, player 2 has already won the game'
            };
        }
        else if (this.gameStatus === game_types_d_1.GameStatus.DRAW) {
            return {
                isValid: false,
                message: 'You cannot make a move, the game has already ended in a draw'
            };
        }
        if (this.activePlayer !== player) {
            return {
                isValid: false,
                message: `Player ${player} cannot move as player ${this.activePlayer} is currently active`
            };
        }
        const { isValidRow, isValidColumn } = this.#getIsCellOnBoard(row, column);
        if (!isValidRow && !isValidColumn) {
            return {
                isValid: false,
                message: `Cell at row ${row} and column ${column} doesn't exist on the board. The row number must be >= 0 and <= ${this.board.length - 1} and the column number must be >= 0 and <= ${this.board[0].length - 1}`
            };
        }
        if (!isValidRow || !isValidColumn) {
            return {
                isValid: false,
                message: `Cell at row ${row} and column ${column} doesn't exist on the board. ${!isValidRow
                    ? `The row number must be >= 0 and <= ${this.board.length - 1}`
                    : ''}${!isValidColumn
                    ? `The column number must be >= 0 and <= ${this.board[0].length - 1}`
                    : ''}`
            };
        }
        if (this.#getIsCellOccupied(row, column)) {
            return {
                isValid: false,
                message: `The cell of row ${row} and column ${column} is already occupied`
            };
        }
        if (!this.#getIsCellOccupied(row - 1, column)) {
            return {
                isValid: false,
                message: `The cell of row ${row} and column ${column} cannot be placed as there is no disc below it`
            };
        }
        return {
            isValid: true,
            message: ''
        };
    }
    #getIsCellOnBoard(row, column) {
        return {
            isValidRow: row >= 0 && row <= this.board.length - 1,
            isValidColumn: column >= 0 && column <= this.board[0].length - 1
        };
    }
    #getIsCellOccupied(row, column) {
        if (row < 0)
            return true;
        return this.board[row][column].player !== undefined;
    }
}
exports.default = Game;
