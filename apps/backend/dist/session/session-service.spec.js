var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Game from '@/game/game';
import GameService from '@/game/game-service';
import InMemoryGameRepository from '@/game/in-memory-game-repository';
import InMemorySessionRepository, { ActiveGameInProgressError } from '@/session/in-memory-session-repository';
import SessionService, { NoSuchSessionError } from '@/session/session-service';
describe('session-service', () => {
    let sessionRepository;
    let sessionService;
    let gameService;
    beforeEach(() => {
        sessionRepository = new InMemorySessionRepository();
        gameService = new GameService(new InMemoryGameRepository(), (...args) => new Game(...args));
        sessionService = new SessionService(sessionRepository, gameService);
    });
    describe('creating a session service', () => {
        describe('given a session repository', () => {
            it('creates a session service', () => {
                expect(sessionService).toBeInstanceOf(SessionService);
            });
        });
    });
    describe('creating a session', () => {
        describe('given the identities of two players', () => {
            it('creates a session', () => __awaiter(void 0, void 0, void 0, function* () {
                const sessionDetails = yield sessionService.createSession({
                    inviterUuid: 'ac698d60-5f6e-4d89-be27-f12c9b054d22',
                    inviteeUuid: 'd5bcfb7a-b8a8-4274-afef-c5db4509813a'
                });
                expect(sessionDetails).toEqual(expect.objectContaining({
                    uuid: expect.toBeUuid(),
                    inviter: expect.objectContaining({
                        uuid: 'ac698d60-5f6e-4d89-be27-f12c9b054d22'
                    }),
                    invitee: expect.objectContaining({
                        uuid: 'd5bcfb7a-b8a8-4274-afef-c5db4509813a'
                    }),
                    status: 'IN_PROGRESS'
                }));
            }));
        });
    });
    describe('retrieving a session', () => {
        describe('given a session has been created', () => {
            describe('when provided with the id of the session', () => {
                it('retrieves details of the session', () => __awaiter(void 0, void 0, void 0, function* () {
                    const { uuid } = yield sessionService.createSession({
                        inviterUuid: 'ac698d60-5f6e-4d89-be27-f12c9b054d22',
                        inviteeUuid: 'd5bcfb7a-b8a8-4274-afef-c5db4509813a'
                    });
                    const retrievedSession = yield sessionService.getSession(uuid);
                    expect(retrievedSession).toEqual(expect.objectContaining({
                        uuid: expect.toBeUuid(),
                        inviter: expect.objectContaining({
                            uuid: 'ac698d60-5f6e-4d89-be27-f12c9b054d22'
                        }),
                        invitee: expect.objectContaining({
                            uuid: 'd5bcfb7a-b8a8-4274-afef-c5db4509813a'
                        }),
                        status: 'IN_PROGRESS'
                    }));
                }));
            });
        });
        describe('when provided with the id of a non-existent session', () => {
            it('throws a "NoSuchSessionError"', () => {
                const sessionUuid = 'b8633095-70cc-4b93-b2ef-e6a55a4341a9';
                expect(() => sessionService.getSession(sessionUuid)).rejects.toThrow(new NoSuchSessionError());
            });
        });
    });
    describe('adding games', () => {
        describe('given an in-progress session', () => {
            describe('with no games', () => {
                it('adds a new game to the session', () => __awaiter(void 0, void 0, void 0, function* () {
                    const { uuid } = yield sessionService.createSession({
                        inviterUuid: '34299162-58de-4e8a-9be3-19fded384c4e',
                        inviteeUuid: '0d559433-a243-489f-a08e-898460324ae6'
                    });
                    expect(sessionService.getGameUuids(uuid)).resolves.toEqual([]);
                    expect(sessionService.getActiveGameUuid(uuid)).resolves.toBeUndefined();
                    yield sessionService.addNewGame(uuid, '34299162-58de-4e8a-9be3-19fded384c4e');
                    const activeGameUuid = yield sessionService.getActiveGameUuid(uuid);
                    expect(activeGameUuid).toBeUuid();
                    expect(sessionService.getGameUuids(uuid)).resolves.toEqual([
                        activeGameUuid
                    ]);
                    expect(sessionService.getActivePlayer(uuid)).resolves.toBe('34299162-58de-4e8a-9be3-19fded384c4e');
                }));
            });
            describe('with previous games', () => {
                describe('and no active games', () => {
                    it('adds a new game to the session', () => __awaiter(void 0, void 0, void 0, function* () {
                        const { uuid } = yield sessionService.createSession({
                            inviterUuid: '34299162-58de-4e8a-9be3-19fded384c4e',
                            inviteeUuid: '0d559433-a243-489f-a08e-898460324ae6'
                        });
                        const firstActiveGameUuid = yield sessionService.addNewGame(uuid, '34299162-58de-4e8a-9be3-19fded384c4e');
                        yield sessionService.completeActiveGame(uuid);
                        const secondActiveGameUuid = yield sessionService.addNewGame(uuid, '34299162-58de-4e8a-9be3-19fded384c4e');
                        expect(firstActiveGameUuid).not.toBe(secondActiveGameUuid);
                        expect(sessionService.getGameUuids(uuid)).resolves.toEqual([
                            firstActiveGameUuid,
                            secondActiveGameUuid
                        ]);
                        expect(sessionService.getActivePlayer(uuid)).resolves.toBe('34299162-58de-4e8a-9be3-19fded384c4e');
                    }));
                });
                describe('and an active game', () => {
                    it('throws an ActiveGameInProgressError', () => __awaiter(void 0, void 0, void 0, function* () {
                        const { uuid } = yield sessionService.createSession({
                            inviterUuid: '34299162-58de-4e8a-9be3-19fded384c4e',
                            inviteeUuid: '0d559433-a243-489f-a08e-898460324ae6'
                        });
                        yield sessionService.addNewGame(uuid, '34299162-58de-4e8a-9be3-19fded384c4e');
                        expect(() => sessionService.addNewGame(uuid, '34299162-58de-4e8a-9be3-19fded384c4e')).rejects.toThrow(new ActiveGameInProgressError());
                        expect(sessionService.getActivePlayer(uuid)).resolves.toBe('34299162-58de-4e8a-9be3-19fded384c4e');
                    }));
                });
            });
        });
    });
    describe('making moves', () => {
        describe('given a session', () => {
            describe('with an active game', () => {
                describe('and a move that is valid for the active game', () => {
                    it('makes the move on the active game', () => __awaiter(void 0, void 0, void 0, function* () {
                        const { uuid } = yield sessionService.createSession({
                            inviterUuid: '5b9ba64a-8abb-4719-a7ec-34a44b245842',
                            inviteeUuid: '03fece2e-3db7-496d-ad2d-d5d8174e537e'
                        });
                        yield sessionService.addNewGame(uuid, '5b9ba64a-8abb-4719-a7ec-34a44b245842');
                        const moveResult = yield sessionService.submitMove(uuid, '5b9ba64a-8abb-4719-a7ec-34a44b245842', {
                            row: 0,
                            column: 0
                        });
                        expect(moveResult).toEqual({
                            moveSuccessful: true
                        });
                        expect(sessionService.getActivePlayer(uuid)).resolves.toBe('03fece2e-3db7-496d-ad2d-d5d8174e537e');
                    }));
                });
                describe('and a move that is not valid for the active game', () => {
                    it('does not make the move on the active game', () => __awaiter(void 0, void 0, void 0, function* () {
                        const { uuid } = yield sessionService.createSession({
                            inviterUuid: '5b9ba64a-8abb-4719-a7ec-34a44b245842',
                            inviteeUuid: '03fece2e-3db7-496d-ad2d-d5d8174e537e'
                        });
                        yield sessionService.addNewGame(uuid, '5b9ba64a-8abb-4719-a7ec-34a44b245842');
                        const moveResult = yield sessionService.submitMove(uuid, '5b9ba64a-8abb-4719-a7ec-34a44b245842', {
                            row: -1,
                            column: 0
                        });
                        expect(moveResult).toEqual(expect.objectContaining({
                            moveSuccessful: false
                        }));
                        expect(sessionService.getActivePlayer(uuid)).resolves.toBe('5b9ba64a-8abb-4719-a7ec-34a44b245842');
                    }));
                });
            });
        });
    });
});
