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
const in_memory_user_repository_1 = __importDefault(require("@/user/in-memory-user-repository"));
const user_service_1 = __importDefault(require("@/user/user-service"));
const invite_service_1 = __importStar(require("@/invite/invite-service"));
const in_memory_invite_repository_1 = __importDefault(require("@/invite/in-memory-invite-repository"));
const invite_service_d_1 = require("@/invite/invite-service.d");
const in_memory_session_repository_1 = __importDefault(require("@/session/in-memory-session-repository"));
const session_service_1 = __importDefault(require("@/session/session-service"));
const game_service_1 = __importDefault(require("@/game/game-service"));
const game_1 = __importDefault(require("@/game/game"));
const in_memory_game_repository_1 = __importDefault(require("@/game/in-memory-game-repository"));
const createUserServiceWithInviterAndInvitee = async () => {
    const repository = new in_memory_user_repository_1.default();
    const userService = new user_service_1.default(repository);
    const inviterDetails = {
        firstName: 'Player',
        lastName: 'One',
        email: 'player1@gmail.com',
        password: 'Hello123'
    };
    const inviteeDetails = {
        firstName: 'Player',
        lastName: 'Two',
        email: 'player2@gmail.com',
        password: 'Hello123'
    };
    await userService.create(inviterDetails);
    await userService.create(inviteeDetails);
    return userService;
};
const createSessionService = async () => {
    const gameRepository = new in_memory_game_repository_1.default();
    const gameService = new game_service_1.default(gameRepository, (...args) => new game_1.default(...args));
    const sessionRepository = new in_memory_session_repository_1.default();
    const sessionService = new session_service_1.default(sessionRepository, gameService);
    return sessionService;
};
describe('invite-service', () => {
    let inviteService;
    let currentTime;
    beforeEach(async () => {
        jest.useFakeTimers({ doNotFake: ['setImmediate'] });
        currentTime = Date.now();
        jest.setSystemTime(currentTime);
        inviteService = new invite_service_1.default(await createUserServiceWithInviterAndInvitee(), await createSessionService(), new in_memory_invite_repository_1.default());
    });
    afterEach(async () => {
        jest.useRealTimers();
    });
    describe('creating invites', () => {
        describe('given an inviter who is an existing user', () => {
            describe('and an invitee who is an existing user', () => {
                it('creates an invite', async () => {
                    const inviteDetails = await inviteService.create({
                        inviter: 'player1@gmail.com',
                        invitee: 'player2@gmail.com'
                    });
                    const lengthOfDayInMilliseconds = 60 * 60 * 24 * 1000;
                    expect(inviteDetails).toEqual({
                        uuid: expect.toBeUuid(),
                        inviter: 'player1@gmail.com',
                        invitee: 'player2@gmail.com',
                        exp: currentTime + lengthOfDayInMilliseconds,
                        status: 'PENDING'
                    });
                });
                describe('and the service was created with an invitation created callback', () => {
                    it('publishes an "invite created" message', async () => {
                        const mockedInvitationCreationCallback = jest.fn();
                        const inviteService = new invite_service_1.default(await createUserServiceWithInviterAndInvitee(), await createSessionService(), new in_memory_invite_repository_1.default(), {
                            [invite_service_d_1.InviteEvents.INVITATION_CREATED]: mockedInvitationCreationCallback
                        });
                        await inviteService.create({
                            inviter: 'player1@gmail.com',
                            invitee: 'player2@gmail.com'
                        });
                        expect(mockedInvitationCreationCallback).toHaveBeenCalledWith({
                            uuid: expect.toBeUuid(),
                            inviter: 'player1@gmail.com',
                            invitee: 'player2@gmail.com',
                            exp: expect.any(Number),
                            status: 'PENDING'
                        });
                    });
                });
            });
            describe('and the inviter and invitee are the same user', () => {
                it('throws an InvalidInvitationError', async () => {
                    const inviteCreationDetails = {
                        inviter: 'player1@gmail.com',
                        invitee: 'player1@gmail.com'
                    };
                    expect(inviteService.create(inviteCreationDetails)).rejects.toThrow(new invite_service_1.InvalidInvitationError('Users can not send invites to themselves.'));
                });
            });
            describe('and an invitee who is not an existing user', () => {
                it('throws an InvalidInvitationError', async () => {
                    const userService = new user_service_1.default(new in_memory_user_repository_1.default());
                    const inviterDetails = {
                        firstName: 'Player',
                        lastName: 'One',
                        email: 'player1@gmail.com',
                        password: 'Hello123'
                    };
                    await userService.create(inviterDetails);
                    const inviteService = new invite_service_1.default(userService, await createSessionService(), new in_memory_invite_repository_1.default());
                    const inviteCreationDetails = {
                        inviter: 'player1@gmail.com',
                        invitee: 'player2@gmail.com'
                    };
                    expect(inviteService.create(inviteCreationDetails)).rejects.toThrow(new invite_service_1.InvalidInvitationError('Invitee does not exist.'));
                });
            });
        });
    });
    describe('retrieving invites', () => {
        describe('given an inviter who is an existing user', () => {
            describe('and an invitee who is an existing user', () => {
                describe('and the inviter invites the invitee', () => {
                    it('returns all invites', async () => {
                        const receivedInviteDetails = await inviteService.create({
                            inviter: 'player1@gmail.com',
                            invitee: 'player2@gmail.com'
                        });
                        await inviteService.create({
                            inviter: 'player2@gmail.com',
                            invitee: 'player1@gmail.com'
                        });
                        const invites = await inviteService.getReceivedInvites('player2@gmail.com');
                        expect(invites).toEqual([receivedInviteDetails]);
                    });
                });
            });
        });
    });
    describe('retrieving an invite', () => {
        describe('given an inviter who is an existing user', () => {
            describe('and an invitee who is an existing user', () => {
                describe('and the inviter invites the invitee', () => {
                    describe('and the invite id is provided', () => {
                        it('returns details of the invite', async () => {
                            const { uuid, exp } = await inviteService.create({
                                inviter: 'player1@gmail.com',
                                invitee: 'player2@gmail.com'
                            });
                            const retrievedInviteDetails = await inviteService.getInvite(uuid);
                            expect(retrievedInviteDetails).toEqual({
                                uuid,
                                inviter: 'player1@gmail.com',
                                invitee: 'player2@gmail.com',
                                exp,
                                status: 'PENDING'
                            });
                        });
                    });
                });
            });
        });
    });
    describe('accepting invites', () => {
        describe('given a pending invite', () => {
            describe('and the invitee accepts', () => {
                it('the invite is accepted', async () => {
                    const { uuid, exp } = await inviteService.create({
                        inviter: 'player1@gmail.com',
                        invitee: 'player2@gmail.com'
                    });
                    await inviteService.acceptInvite(uuid);
                    const retrievedInviteDetails = await inviteService.getInvite(uuid);
                    expect(retrievedInviteDetails).toEqual({
                        uuid,
                        inviter: 'player1@gmail.com',
                        invitee: 'player2@gmail.com',
                        exp,
                        status: 'ACCEPTED'
                    });
                });
            });
        });
    });
});
