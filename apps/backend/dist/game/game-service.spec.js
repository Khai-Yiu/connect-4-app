"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const in_memory_game_repository_1 = __importDefault(require("@/game/in-memory-game-repository"));
const game_1 = __importDefault(require("@/game/game"));
const game_service_1 = __importDefault(require("@/game/game-service"));
const to_ascii_table_1 = __importDefault(require("@/utils/to-ascii-table"));
function toAsciiTable(board) {
    const cellResolver = (cell) => cell.player === undefined ? '' : `${cell.player}`;
    return (0, to_ascii_table_1.default)(board, cellResolver);
}
describe('game-service', () => {
    let gameRepository;
    let gameService;
    beforeEach(() => {
        gameRepository = new in_memory_game_repository_1.default();
        gameService = new game_service_1.default(gameRepository, (...args) => new game_1.default(...args));
    });
    describe('creating a game service', () => {
        describe('given a game repository', () => {
            describe('and a game constructor', () => {
                it('creates a game service', () => {
                    const gameRepository = new in_memory_game_repository_1.default();
                    const gameService = new game_service_1.default(gameRepository, (...args) => new game_1.default(...args));
                    expect(gameService).toBeInstanceOf(game_service_1.default);
                });
            });
        });
    });
    describe('creating a game', () => {
        let gameService;
        beforeEach(() => {
            const gameRepository = new in_memory_game_repository_1.default();
            gameService = new game_service_1.default(gameRepository, (...args) => new game_1.default(...args));
        });
        describe('given no arguments', () => {
            it('creates a new game with a 6x7 board', async () => {
                const gameUuid = await gameService.createGame();
                expect(gameUuid).toBeUuid();
                const gameDetails = await gameService.getGameDetails(gameUuid);
                expect(gameDetails).toEqual(expect.objectContaining({
                    boardDimensions: {
                        rows: 6,
                        columns: 7
                    }
                }));
            });
        });
    });
    describe('making a move', () => {
        let mockedPlayerMovedEventHandler;
        let gameService;
        beforeEach(() => {
            mockedPlayerMovedEventHandler = jest.fn();
            const gameRepository = new in_memory_game_repository_1.default();
            gameService = new game_service_1.default(gameRepository, (...args) => new game_1.default(...args), mockedPlayerMovedEventHandler);
        });
        describe('given the uuid of a game', () => {
            describe('and a valid move', () => {
                it('makes the move', async () => {
                    const gameUuid = await gameService.createGame();
                    const result = await gameService.submitMove(gameUuid, {
                        player: 1,
                        targetCell: {
                            row: 0,
                            column: 0
                        }
                    });
                    expect(result).toEqual({ moveSuccessful: true });
                    expect(mockedPlayerMovedEventHandler).toHaveBeenCalledWith({
                        type: 'PLAYER_MOVED',
                        payload: {
                            player: 1,
                            targetCell: {
                                row: 0,
                                column: 0
                            }
                        }
                    });
                    const board = (await gameService.getGameDetails(gameUuid))
                        .board;
                    expect(toAsciiTable(board)).toMatchInlineSnapshot(`
                        "
                        |---|--|--|--|--|--|--|
                        | 1 |  |  |  |  |  |  |
                        |---|--|--|--|--|--|--|
                        |   |  |  |  |  |  |  |
                        |---|--|--|--|--|--|--|
                        |   |  |  |  |  |  |  |
                        |---|--|--|--|--|--|--|
                        |   |  |  |  |  |  |  |
                        |---|--|--|--|--|--|--|
                        |   |  |  |  |  |  |  |
                        |---|--|--|--|--|--|--|
                        |   |  |  |  |  |  |  |
                        |---|--|--|--|--|--|--|"
                    `);
                });
            });
            describe('and an invalid move', () => {
                it('does not make the move', async () => {
                    const gameUuid = await gameService.createGame();
                    const result = await gameService.submitMove(gameUuid, {
                        player: 1,
                        targetCell: {
                            row: -1,
                            column: 0
                        }
                    });
                    expect(result).toEqual(expect.objectContaining({ moveSuccessful: false }));
                    expect(mockedPlayerMovedEventHandler).not.toHaveBeenCalled();
                });
            });
        });
    });
});
