var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import InMemoryUserRepositoryFactory from '@/user/in-memory-user-repository';
import UserService from '@/user/user-service';
import InviteService, { InvalidInvitationError } from '@/invite/invite-service';
import InMemoryInviteRepository from '@/invite/in-memory-invite-repository';
import { InviteEvents } from '@/invite/invite-service.d';
import InMemorySessionRepository from '@/session/in-memory-session-repository';
import SessionService from '@/session/session-service';
import GameService from '@/game/game-service';
import Game from '@/game/game';
import InMemoryGameRepository from '@/game/in-memory-game-repository';
const createUserServiceWithInviterAndInvitee = () => __awaiter(void 0, void 0, void 0, function* () {
    const repository = new InMemoryUserRepositoryFactory();
    const userService = new UserService(repository);
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
    yield userService.create(inviterDetails);
    yield userService.create(inviteeDetails);
    return userService;
});
const createSessionService = () => __awaiter(void 0, void 0, void 0, function* () {
    const gameRepository = new InMemoryGameRepository();
    const gameService = new GameService(gameRepository, (...args) => new Game(...args));
    const sessionRepository = new InMemorySessionRepository();
    const sessionService = new SessionService(sessionRepository, gameService);
    return sessionService;
});
describe('invite-service', () => {
    let inviteService;
    let currentTime;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        jest.useFakeTimers({ doNotFake: ['setImmediate'] });
        currentTime = Date.now();
        jest.setSystemTime(currentTime);
        inviteService = new InviteService(yield createUserServiceWithInviterAndInvitee(), yield createSessionService(), new InMemoryInviteRepository());
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        jest.useRealTimers();
    }));
    describe('creating invites', () => {
        describe('given an inviter who is an existing user', () => {
            describe('and an invitee who is an existing user', () => {
                it('creates an invite', () => __awaiter(void 0, void 0, void 0, function* () {
                    const inviteDetails = yield inviteService.create({
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
                }));
                describe('and the service was created with an invitation created callback', () => {
                    it('publishes an "invite created" message', () => __awaiter(void 0, void 0, void 0, function* () {
                        const mockedInvitationCreationCallback = jest.fn();
                        const inviteService = new InviteService(yield createUserServiceWithInviterAndInvitee(), yield createSessionService(), new InMemoryInviteRepository(), {
                            [InviteEvents.INVITATION_CREATED]: mockedInvitationCreationCallback
                        });
                        yield inviteService.create({
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
                    }));
                });
            });
            describe('and the inviter and invitee are the same user', () => {
                it('throws an InvalidInvitationError', () => __awaiter(void 0, void 0, void 0, function* () {
                    const inviteCreationDetails = {
                        inviter: 'player1@gmail.com',
                        invitee: 'player1@gmail.com'
                    };
                    expect(inviteService.create(inviteCreationDetails)).rejects.toThrow(new InvalidInvitationError('Users can not send invites to themselves.'));
                }));
            });
            describe('and an invitee who is not an existing user', () => {
                it('throws an InvalidInvitationError', () => __awaiter(void 0, void 0, void 0, function* () {
                    const userService = new UserService(new InMemoryUserRepositoryFactory());
                    const inviterDetails = {
                        firstName: 'Player',
                        lastName: 'One',
                        email: 'player1@gmail.com',
                        password: 'Hello123'
                    };
                    yield userService.create(inviterDetails);
                    const inviteService = new InviteService(userService, yield createSessionService(), new InMemoryInviteRepository());
                    const inviteCreationDetails = {
                        inviter: 'player1@gmail.com',
                        invitee: 'player2@gmail.com'
                    };
                    expect(inviteService.create(inviteCreationDetails)).rejects.toThrow(new InvalidInvitationError('Invitee does not exist.'));
                }));
            });
        });
    });
    describe('retrieving invites', () => {
        describe('given an inviter who is an existing user', () => {
            describe('and an invitee who is an existing user', () => {
                describe('and the inviter invites the invitee', () => {
                    it('returns all invites', () => __awaiter(void 0, void 0, void 0, function* () {
                        const receivedInviteDetails = yield inviteService.create({
                            inviter: 'player1@gmail.com',
                            invitee: 'player2@gmail.com'
                        });
                        yield inviteService.create({
                            inviter: 'player2@gmail.com',
                            invitee: 'player1@gmail.com'
                        });
                        const invites = yield inviteService.getReceivedInvites('player2@gmail.com');
                        expect(invites).toEqual([receivedInviteDetails]);
                    }));
                });
            });
        });
    });
    describe('retrieving an invite', () => {
        describe('given an inviter who is an existing user', () => {
            describe('and an invitee who is an existing user', () => {
                describe('and the inviter invites the invitee', () => {
                    describe('and the invite id is provided', () => {
                        it('returns details of the invite', () => __awaiter(void 0, void 0, void 0, function* () {
                            const { uuid, exp } = yield inviteService.create({
                                inviter: 'player1@gmail.com',
                                invitee: 'player2@gmail.com'
                            });
                            const retrievedInviteDetails = yield inviteService.getInvite(uuid);
                            expect(retrievedInviteDetails).toEqual({
                                uuid,
                                inviter: 'player1@gmail.com',
                                invitee: 'player2@gmail.com',
                                exp,
                                status: 'PENDING'
                            });
                        }));
                    });
                });
            });
        });
    });
    describe('accepting invites', () => {
        describe('given a pending invite', () => {
            describe('and the invitee accepts', () => {
                it('the invite is accepted', () => __awaiter(void 0, void 0, void 0, function* () {
                    const { uuid, exp } = yield inviteService.create({
                        inviter: 'player1@gmail.com',
                        invitee: 'player2@gmail.com'
                    });
                    yield inviteService.acceptInvite(uuid);
                    const retrievedInviteDetails = yield inviteService.getInvite(uuid);
                    expect(retrievedInviteDetails).toEqual({
                        uuid,
                        inviter: 'player1@gmail.com',
                        invitee: 'player2@gmail.com',
                        exp,
                        status: 'ACCEPTED'
                    });
                }));
            });
        });
    });
});
