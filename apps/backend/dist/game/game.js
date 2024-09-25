var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Game_instances, _Game_createBoard, _Game_createPlayerStats, _Game__move, _Game_createValidatedMove, _Game_validateMove, _Game_getIsCellOnBoard, _Game_getIsCellOccupied;
import { GameStatus } from '@/game/game-types.d';
import deepClone from '@/utils/deep-clone';
import getIsWinningMove from './get-is-winning-move';
const DEFAULT_BOARD_DIMENSIONS = {
    rows: 6,
    columns: 7
};
class Game {
    constructor({ uuid, board, boardDimensions = DEFAULT_BOARD_DIMENSIONS, activePlayer = 1, playerStats, gameStatus = GameStatus.IN_PROGRESS } = {
        uuid: crypto.randomUUID(),
        boardDimensions: DEFAULT_BOARD_DIMENSIONS,
        activePlayer: 1,
        gameStatus: GameStatus.IN_PROGRESS
    }) {
        _Game_instances.add(this);
        _Game_createBoard.set(this, ({ rows, columns }) => new Array(rows).fill(undefined).map(() => new Array(columns).fill(undefined).map(() => ({
            player: undefined
        }))));
        _Game_createPlayerStats.set(this, ({ rows, columns }) => {
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
        });
        this.move = __classPrivateFieldGet(this, _Game_instances, "m", _Game_createValidatedMove).call(this, __classPrivateFieldGet(this, _Game_instances, "m", _Game__move).bind(this));
        this.uuid = uuid;
        this.board = board !== null && board !== void 0 ? board : __classPrivateFieldGet(this, _Game_createBoard, "f").call(this, boardDimensions);
        this.boardDimensions = boardDimensions;
        this.activePlayer = activePlayer;
        this.playerStats =
            playerStats !== null && playerStats !== void 0 ? playerStats : __classPrivateFieldGet(this, _Game_createPlayerStats, "f").call(this, boardDimensions);
        this.gameStatus = gameStatus;
    }
    getBoard() {
        return deepClone(this.board);
    }
    getDetails() {
        return {
            uuid: this.uuid,
            board: deepClone(this.board),
            boardDimensions: deepClone(this.boardDimensions),
            activePlayer: this.activePlayer,
            playerStats: deepClone(this.playerStats),
            gameStatus: this.gameStatus
        };
    }
}
_Game_createBoard = new WeakMap(), _Game_createPlayerStats = new WeakMap(), _Game_instances = new WeakSet(), _Game__move = function _Game__move({ player, targetCell: { row, column } }) {
    const { isWin } = getIsWinningMove(this.getBoard(), {
        player,
        targetCell: { row, column }
    });
    this.board[row][column] = { player: player };
    this.playerStats[this.activePlayer].remainingDiscs--;
    this.activePlayer = this.activePlayer === 2 ? 1 : 2;
    if (isWin) {
        this.gameStatus =
            this.activePlayer === 2
                ? GameStatus.PLAYER_ONE_WON
                : GameStatus.PLAYER_TWO_WON;
    }
    else if (this.playerStats[1].remainingDiscs === 0 &&
        this.playerStats[2].remainingDiscs === 0) {
        this.gameStatus = GameStatus.DRAW;
    }
    return {
        moveSuccessful: true
    };
}, _Game_createValidatedMove = function _Game_createValidatedMove(moveFunction) {
    return (playerMoveDetails) => {
        const { isValid, message } = __classPrivateFieldGet(this, _Game_instances, "m", _Game_validateMove).call(this, playerMoveDetails);
        return isValid
            ? moveFunction(playerMoveDetails)
            : { moveSuccessful: false, message };
    };
}, _Game_validateMove = function _Game_validateMove({ player, targetCell: { row, column } }) {
    if (this.gameStatus === 'PLAYER_ONE_WON') {
        return {
            isValid: false,
            message: 'You cannot make a move, player 1 has already won the game'
        };
    }
    else if (this.gameStatus === GameStatus.PLAYER_TWO_WON) {
        return {
            isValid: false,
            message: 'You cannot make a move, player 2 has already won the game'
        };
    }
    else if (this.gameStatus === GameStatus.DRAW) {
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
    const { isValidRow, isValidColumn } = __classPrivateFieldGet(this, _Game_instances, "m", _Game_getIsCellOnBoard).call(this, row, column);
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
    if (__classPrivateFieldGet(this, _Game_instances, "m", _Game_getIsCellOccupied).call(this, row, column)) {
        return {
            isValid: false,
            message: `The cell of row ${row} and column ${column} is already occupied`
        };
    }
    if (!__classPrivateFieldGet(this, _Game_instances, "m", _Game_getIsCellOccupied).call(this, row - 1, column)) {
        return {
            isValid: false,
            message: `The cell of row ${row} and column ${column} cannot be placed as there is no disc below it`
        };
    }
    return {
        isValid: true,
        message: ''
    };
}, _Game_getIsCellOnBoard = function _Game_getIsCellOnBoard(row, column) {
    return {
        isValidRow: row >= 0 && row <= this.board.length - 1,
        isValidColumn: column >= 0 && column <= this.board[0].length - 1
    };
}, _Game_getIsCellOccupied = function _Game_getIsCellOccupied(row, column) {
    if (row < 0)
        return true;
    return this.board[row][column].player !== undefined;
};
export default Game;
