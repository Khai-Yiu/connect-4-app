var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { GameStatus } from '@/game/game-types.d';
import InMemoryGameRepository from '@/game/in-memory-game-repository';
describe('in-memory-game-repository', () => {
    let gameRepository;
    beforeEach(() => {
        gameRepository = new InMemoryGameRepository();
    });
    describe('creating a game repository', () => {
        it('creates an in-memory game repository', () => {
            const gameRepository = new InMemoryGameRepository();
            expect(gameRepository).toBeInstanceOf(InMemoryGameRepository);
        });
    });
    describe('saving a game', () => {
        describe('when given a game to save', () => {
            it('saves the game', () => __awaiter(void 0, void 0, void 0, function* () {
                const gameDetails = {
                    activePlayer: 1,
                    playerStats: {
                        1: {
                            playerNumber: 1,
                            remainingDiscs: 2
                        },
                        2: {
                            playerNumber: 2,
                            remainingDiscs: 2
                        }
                    },
                    gameStatus: GameStatus.IN_PROGRESS
                };
                const savedGameDetails = yield gameRepository.saveGame(gameDetails);
                expect(savedGameDetails).toEqual(Object.assign({ uuid: expect.toBeUuid() }, gameDetails));
            }));
            describe('and a uuid to save the game', () => {
                describe('which no other game has been saved under', () => {
                    it('saves the game', () => __awaiter(void 0, void 0, void 0, function* () {
                        const gameUuid = '3507af63-cc71-43ad-93ea-dc06eaef70b2';
                        const gameDetailsWithUuid = {
                            uuid: gameUuid,
                            board: new Array(6).fill(undefined).map(() => new Array(7).fill(undefined).map(() => ({
                                player: undefined
                            }))),
                            boardDimensions: {
                                rows: 6,
                                columns: 7
                            },
                            activePlayer: 1,
                            playerStats: {
                                1: {
                                    playerNumber: 1,
                                    remainingDiscs: 21
                                },
                                2: {
                                    playerNumber: 2,
                                    remainingDiscs: 21
                                }
                            },
                            gameStatus: 'IN_PROGRESS'
                        };
                        yield gameRepository.saveGame(gameDetailsWithUuid);
                        const retrievedGameDetails = yield gameRepository.loadGame(gameUuid);
                        expect(retrievedGameDetails).toEqual(Object.assign({}, gameDetailsWithUuid));
                    }));
                });
                describe('which a game has already been saved under', () => {
                    it('replaces the saved game with the updated game', () => __awaiter(void 0, void 0, void 0, function* () {
                        const gameUuid = '3507af63-cc71-43ad-93ea-dc06eaef70b2';
                        const gameDetailsWithUuid = {
                            uuid: gameUuid,
                            board: new Array(6).fill(undefined).map(() => new Array(7).fill(undefined).map(() => ({
                                player: undefined
                            }))),
                            boardDimensions: {
                                rows: 6,
                                columns: 7
                            },
                            activePlayer: 1,
                            playerStats: {
                                1: {
                                    playerNumber: 1,
                                    remainingDiscs: 21
                                },
                                2: {
                                    playerNumber: 2,
                                    remainingDiscs: 21
                                }
                            },
                            gameStatus: 'IN_PROGRESS'
                        };
                        yield gameRepository.saveGame(gameDetailsWithUuid);
                        yield gameRepository.saveGame(Object.assign(Object.assign({}, gameDetailsWithUuid), { activePlayer: 2 }));
                        const retrievedGameDetails = yield gameRepository.loadGame(gameUuid);
                        expect(retrievedGameDetails).toEqual(Object.assign(Object.assign({}, gameDetailsWithUuid), { activePlayer: 2 }));
                    }));
                });
            });
        });
    });
    describe('loading a game', () => {
        describe('given a game has been saved', () => {
            describe('when given an id of a game', () => {
                it('returns the details of the game', () => __awaiter(void 0, void 0, void 0, function* () {
                    const gameDetails = {
                        activePlayer: 1,
                        playerStats: {
                            1: {
                                playerNumber: 1,
                                remainingDiscs: 2
                            },
                            2: {
                                playerNumber: 2,
                                remainingDiscs: 2
                            }
                        },
                        gameStatus: GameStatus.IN_PROGRESS
                    };
                    const { uuid } = yield gameRepository.saveGame(gameDetails);
                    const loadedGame = yield gameRepository.loadGame(uuid);
                    expect(loadedGame).toEqual(Object.assign({ uuid: expect.toBeUuid() }, gameDetails));
                }));
            });
        });
    });
});
