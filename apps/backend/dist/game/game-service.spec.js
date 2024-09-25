var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import InMemoryGameRepository from '@/game/in-memory-game-repository';
import Game from '@/game/game';
import GameService from '@/game/game-service';
import _toAsciiTable from '@/utils/to-ascii-table';
function toAsciiTable(board) {
    const cellResolver = (cell) => cell.player === undefined ? '' : `${cell.player}`;
    return _toAsciiTable(board, cellResolver);
}
describe('game-service', () => {
    let gameRepository;
    let gameService;
    beforeEach(() => {
        gameRepository = new InMemoryGameRepository();
        gameService = new GameService(gameRepository, (...args) => new Game(...args));
    });
    describe('creating a game service', () => {
        describe('given a game repository', () => {
            describe('and a game constructor', () => {
                it('creates a game service', () => {
                    const gameRepository = new InMemoryGameRepository();
                    const gameService = new GameService(gameRepository, (...args) => new Game(...args));
                    expect(gameService).toBeInstanceOf(GameService);
                });
            });
        });
    });
    describe('creating a game', () => {
        let gameService;
        beforeEach(() => {
            const gameRepository = new InMemoryGameRepository();
            gameService = new GameService(gameRepository, (...args) => new Game(...args));
        });
        describe('given no arguments', () => {
            it('creates a new game with a 6x7 board', () => __awaiter(void 0, void 0, void 0, function* () {
                const gameUuid = yield gameService.createGame();
                expect(gameUuid).toBeUuid();
                const gameDetails = yield gameService.getGameDetails(gameUuid);
                expect(gameDetails).toEqual(expect.objectContaining({
                    boardDimensions: {
                        rows: 6,
                        columns: 7
                    }
                }));
            }));
        });
    });
    describe('making a move', () => {
        let mockedPlayerMovedEventHandler;
        let gameService;
        beforeEach(() => {
            mockedPlayerMovedEventHandler = jest.fn();
            const gameRepository = new InMemoryGameRepository();
            gameService = new GameService(gameRepository, (...args) => new Game(...args), mockedPlayerMovedEventHandler);
        });
        describe('given the uuid of a game', () => {
            describe('and a valid move', () => {
                it('makes the move', () => __awaiter(void 0, void 0, void 0, function* () {
                    const gameUuid = yield gameService.createGame();
                    const result = yield gameService.submitMove(gameUuid, {
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
                    const board = (yield gameService.getGameDetails(gameUuid))
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
                }));
            });
            describe('and an invalid move', () => {
                it('does not make the move', () => __awaiter(void 0, void 0, void 0, function* () {
                    const gameUuid = yield gameService.createGame();
                    const result = yield gameService.submitMove(gameUuid, {
                        player: 1,
                        targetCell: {
                            row: -1,
                            column: 0
                        }
                    });
                    expect(result).toEqual(expect.objectContaining({ moveSuccessful: false }));
                    expect(mockedPlayerMovedEventHandler).not.toHaveBeenCalled();
                }));
            });
        });
    });
});
