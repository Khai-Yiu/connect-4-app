"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const game_1 = __importDefault(require("@/game/game"));
const game_service_1 = __importDefault(require("@/game/game-service"));
const in_memory_game_repository_1 = __importDefault(require("@/game/in-memory-game-repository"));
const in_memory_session_repository_1 = __importStar(require("@/session/in-memory-session-repository"));
const session_service_1 = __importStar(require("@/session/session-service"));
describe('session-service', () => {
    let sessionRepository;
    let sessionService;
    let gameService;
    beforeEach(() => {
        sessionRepository = new in_memory_session_repository_1.default();
        gameService = new game_service_1.default(new in_memory_game_repository_1.default(), (...args) => new game_1.default(...args));
        sessionService = new session_service_1.default(sessionRepository, gameService);
    });
    describe('creating a session service', () => {
        describe('given a session repository', () => {
            it('creates a session service', () => {
                expect(sessionService).toBeInstanceOf(session_service_1.default);
            });
        });
    });
    describe('creating a session', () => {
        describe('given the identities of two players', () => {
            it('creates a session', async () => {
                const sessionDetails = await sessionService.createSession({
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
            });
        });
    });
    describe('retrieving a session', () => {
        describe('given a session has been created', () => {
            describe('when provided with the id of the session', () => {
                it('retrieves details of the session', async () => {
                    const { uuid } = await sessionService.createSession({
                        inviterUuid: 'ac698d60-5f6e-4d89-be27-f12c9b054d22',
                        inviteeUuid: 'd5bcfb7a-b8a8-4274-afef-c5db4509813a'
                    });
                    const retrievedSession = await sessionService.getSession(uuid);
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
                });
            });
        });
        describe('when provided with the id of a non-existent session', () => {
            it('throws a "NoSuchSessionError"', () => {
                const sessionUuid = 'b8633095-70cc-4b93-b2ef-e6a55a4341a9';
                expect(() => sessionService.getSession(sessionUuid)).rejects.toThrow(new session_service_1.NoSuchSessionError());
            });
        });
    });
    describe('adding games', () => {
        describe('given an in-progress session', () => {
            describe('with no games', () => {
                it('adds a new game to the session', async () => {
                    const { uuid } = await sessionService.createSession({
                        inviterUuid: '34299162-58de-4e8a-9be3-19fded384c4e',
                        inviteeUuid: '0d559433-a243-489f-a08e-898460324ae6'
                    });
                    expect(sessionService.getGameUuids(uuid)).resolves.toEqual([]);
                    expect(sessionService.getActiveGameUuid(uuid)).resolves.toBeUndefined();
                    await sessionService.addNewGame(uuid, '34299162-58de-4e8a-9be3-19fded384c4e');
                    const activeGameUuid = await sessionService.getActiveGameUuid(uuid);
                    expect(activeGameUuid).toBeUuid();
                    expect(sessionService.getGameUuids(uuid)).resolves.toEqual([
                        activeGameUuid
                    ]);
                    expect(sessionService.getActivePlayer(uuid)).resolves.toBe('34299162-58de-4e8a-9be3-19fded384c4e');
                });
            });
            describe('with previous games', () => {
                describe('and no active games', () => {
                    it('adds a new game to the session', async () => {
                        const { uuid } = await sessionService.createSession({
                            inviterUuid: '34299162-58de-4e8a-9be3-19fded384c4e',
                            inviteeUuid: '0d559433-a243-489f-a08e-898460324ae6'
                        });
                        const firstActiveGameUuid = await sessionService.addNewGame(uuid, '34299162-58de-4e8a-9be3-19fded384c4e');
                        await sessionService.completeActiveGame(uuid);
                        const secondActiveGameUuid = await sessionService.addNewGame(uuid, '34299162-58de-4e8a-9be3-19fded384c4e');
                        expect(firstActiveGameUuid).not.toBe(secondActiveGameUuid);
                        expect(sessionService.getGameUuids(uuid)).resolves.toEqual([
                            firstActiveGameUuid,
                            secondActiveGameUuid
                        ]);
                        expect(sessionService.getActivePlayer(uuid)).resolves.toBe('34299162-58de-4e8a-9be3-19fded384c4e');
                    });
                });
                describe('and an active game', () => {
                    it('throws an ActiveGameInProgressError', async () => {
                        const { uuid } = await sessionService.createSession({
                            inviterUuid: '34299162-58de-4e8a-9be3-19fded384c4e',
                            inviteeUuid: '0d559433-a243-489f-a08e-898460324ae6'
                        });
                        await sessionService.addNewGame(uuid, '34299162-58de-4e8a-9be3-19fded384c4e');
                        expect(() => sessionService.addNewGame(uuid, '34299162-58de-4e8a-9be3-19fded384c4e')).rejects.toThrow(new in_memory_session_repository_1.ActiveGameInProgressError());
                        expect(sessionService.getActivePlayer(uuid)).resolves.toBe('34299162-58de-4e8a-9be3-19fded384c4e');
                    });
                });
            });
        });
    });
    describe('making moves', () => {
        describe('given a session', () => {
            describe('with an active game', () => {
                describe('and a move that is valid for the active game', () => {
                    it('makes the move on the active game', async () => {
                        const { uuid } = await sessionService.createSession({
                            inviterUuid: '5b9ba64a-8abb-4719-a7ec-34a44b245842',
                            inviteeUuid: '03fece2e-3db7-496d-ad2d-d5d8174e537e'
                        });
                        await sessionService.addNewGame(uuid, '5b9ba64a-8abb-4719-a7ec-34a44b245842');
                        const moveResult = await sessionService.submitMove(uuid, '5b9ba64a-8abb-4719-a7ec-34a44b245842', {
                            row: 0,
                            column: 0
                        });
                        expect(moveResult).toEqual({
                            moveSuccessful: true
                        });
                        expect(sessionService.getActivePlayer(uuid)).resolves.toBe('03fece2e-3db7-496d-ad2d-d5d8174e537e');
                    });
                });
                describe('and a move that is not valid for the active game', () => {
                    it('does not make the move on the active game', async () => {
                        const { uuid } = await sessionService.createSession({
                            inviterUuid: '5b9ba64a-8abb-4719-a7ec-34a44b245842',
                            inviteeUuid: '03fece2e-3db7-496d-ad2d-d5d8174e537e'
                        });
                        await sessionService.addNewGame(uuid, '5b9ba64a-8abb-4719-a7ec-34a44b245842');
                        const moveResult = await sessionService.submitMove(uuid, '5b9ba64a-8abb-4719-a7ec-34a44b245842', {
                            row: -1,
                            column: 0
                        });
                        expect(moveResult).toEqual(expect.objectContaining({
                            moveSuccessful: false
                        }));
                        expect(sessionService.getActivePlayer(uuid)).resolves.toBe('5b9ba64a-8abb-4719-a7ec-34a44b245842');
                    });
                });
            });
        });
    });
});
