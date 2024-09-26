"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("@/app"));
const test_fixture_1 = __importDefault(require("@/test-fixture/test-fixture"));
const jose_1 = require("jose");
const supertest_1 = __importDefault(require("supertest"));
const halson_1 = __importDefault(require("halson"));
const sessionUriRegex = /^\/session\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
describe('invite-integration', () => {
    let app;
    let jwtKeyPair;
    let testFixture;
    let currentDateInMilliseconds;
    beforeAll(async () => {
        jwtKeyPair = await (0, jose_1.generateKeyPair)('RS256');
    });
    beforeEach(() => {
        jest.useFakeTimers({
            doNotFake: ['setImmediate']
        });
        currentDateInMilliseconds = Date.now();
        jest.setSystemTime(currentDateInMilliseconds);
        app = (0, app_1.default)({
            stage: 'TEST',
            keySet: jwtKeyPair
        });
        testFixture = new test_fixture_1.default(app);
    });
    afterEach(() => {
        jest.useRealTimers();
    });
    describe('creating an invite', () => {
        describe('given the inviter is not logged in', () => {
            describe('when the inviter sends an invitation', () => {
                it('returns http status code 401', async () => {
                    await testFixture
                        .createInvite('player1@gmail.com', 'player2@gmail.com')
                        .run();
                    const response = testFixture.getResponses(0);
                    expect(response.statusCode).toBe(401);
                    expect(response.body.errors).toEqual([
                        'You must be logged in to send an invite.'
                    ]);
                });
            });
        });
        describe('given an inviter that is an existing user', () => {
            describe('and the inviter is logged in', () => {
                describe('and an invitee that is an existing user', () => {
                    describe('when the inviter sends an invitation on behalf of another user', () => {
                        it('return http status code 401', async () => {
                            await testFixture
                                .createUser('player1@gmail.com', 'Hello123')
                                .createUser('player2@gmail.com', 'Hello123')
                                .createUser('player3@gmail.com', 'Hello123')
                                .login('player1@gmail.com', 'Hello123')
                                .createInvite('player3@gmail.com', 'player2@gmail.com', { authenticatedUser: 'player1@gmail.com' })
                                .run();
                            const response = testFixture.getResponses(4);
                            expect(response.statusCode).toBe(401);
                            expect(response.body.errors).toEqual([
                                'You can not send an invite as another user.'
                            ]);
                        });
                    });
                    describe('when the inviter sends an invitation to the invitee', () => {
                        it('creates an invitation', async () => {
                            await testFixture
                                .createUser('player1@gmail.com', 'Hello123')
                                .createUser('player2@gmail.com', 'Hello123')
                                .login('player1@gmail.com', 'Hello123')
                                .createInvite('player1@gmail.com', 'player2@gmail.com')
                                .run();
                            const response = testFixture.getResponses(3);
                            const lengthOfDayInMilliseconds = 60 * 60 * 24 * 1000;
                            expect(response.statusCode).toBe(201);
                            expect(response.body.invite).toEqual({
                                uuid: expect.toBeUuid(),
                                inviter: 'player1@gmail.com',
                                invitee: 'player2@gmail.com',
                                exp: currentDateInMilliseconds +
                                    lengthOfDayInMilliseconds,
                                status: 'PENDING'
                            });
                        });
                    });
                });
            });
            describe('when the inviter sends an invitation to themselves', () => {
                it('returns with http status code 403', async () => {
                    await testFixture
                        .createUser('player1@gmail.com', 'Hello123')
                        .login('player1@gmail.com', 'Hello123')
                        .createInvite('player1@gmail.com', 'player1@gmail.com')
                        .run();
                    const response = testFixture.getResponses(2);
                    expect(response.statusCode).toBe(403);
                    expect(response.body.errors).toEqual([
                        'Users can not send invites to themselves.'
                    ]);
                });
            });
            describe('and an inviter sends an invite to the invitee', () => {
                describe('and the invitee is not an existing user', () => {
                    it('responds with http status code 403', async () => {
                        await testFixture
                            .createUser('player1@gmail.com', 'Hello123')
                            .login('player1@gmail.com', 'Hello123')
                            .createInvite('player1@gmail.com', 'player2@gmail.com')
                            .run();
                        const response = testFixture.getResponses(2);
                        expect(response.statusCode).toBe(403);
                        expect(response.body.errors).toEqual([
                            'Invitee does not exist.'
                        ]);
                    });
                });
            });
        });
    });
    describe('retrieving received invites', () => {
        describe('given an invite exists', () => {
            describe('and a user logged in as the invites', () => {
                describe('when the user retrieves their received invites', () => {
                    it('their received invites will be retrieved', async () => {
                        await testFixture
                            .createUser('player1@gmail.com', 'Hello123')
                            .createUser('player2@gmail.com', 'Hello123')
                            .login('player1@gmail.com', 'Hello123')
                            .login('player2@gmail.com', 'Hello123')
                            .createInvite('player1@gmail.com', 'player2@gmail.com')
                            .createInvite('player2@gmail.com', 'player1@gmail.com')
                            .getReceivedInvites('player2@gmail.com')
                            .run();
                        const { body: { invite: { uuid } } } = testFixture.getResponses(4);
                        const response = testFixture.getResponses(6);
                        const lengthOfDayInMilliseconds = 60 * 60 * 24 * 1000;
                        expect(response.statusCode).toBe(201);
                        expect(response.body.invites).toEqual([
                            {
                                uuid: expect.toBeUuid(),
                                inviter: 'player1@gmail.com',
                                invitee: 'player2@gmail.com',
                                exp: currentDateInMilliseconds +
                                    lengthOfDayInMilliseconds,
                                status: 'PENDING',
                                _links: {
                                    accept: {
                                        href: `/invite/${uuid}/accept`,
                                        method: 'POST'
                                    },
                                    decline: {
                                        href: `/invite/${uuid}/decline`,
                                        method: 'POST'
                                    }
                                }
                            }
                        ]);
                    });
                });
            });
        });
    });
    describe('accepting an invite', () => {
        describe('given a user is logged in', () => {
            describe('and they have received a pending invite', () => {
                describe('when the invite is accepted', () => {
                    it('marks the invite as accepted and creates a new session ', async () => {
                        await testFixture
                            .createUser('inviter@gmail.com', 'Hello123')
                            .createUser('invitee@gmail.com', 'Hello123')
                            .login('inviter@gmail.com', 'Hello123')
                            .login('invitee@gmail.com', 'Hello123')
                            .createInvite('inviter@gmail.com', 'invitee@gmail.com')
                            .getReceivedInvites('invitee@gmail.com')
                            .run();
                        const loginResponse = testFixture.getResponses(3);
                        const receivedInvitesResponse = testFixture.getResponses(5);
                        const acceptLink = receivedInvitesResponse.body.invites[0]._links
                            .accept.href;
                        const inviteUuid = receivedInvitesResponse.body.invites[0].uuid;
                        const response = await (0, supertest_1.default)(app)
                            .post(acceptLink)
                            .set('Authorization', loginResponse.headers.authorization);
                        expect(response.body).toEqual({
                            _links: {
                                self: {
                                    href: `/invite/${inviteUuid}`
                                },
                                related: [
                                    {
                                        href: expect.stringMatching(sessionUriRegex)
                                    }
                                ]
                            }
                        });
                        const resource = (0, halson_1.default)(response.body);
                        const { href: inviteUri } = resource.getLink('self', {
                            href: ''
                        });
                        const { href: sessionUri } = resource.getLink('related', { href: '' });
                        const inviteResponse = await (0, supertest_1.default)(app)
                            .get(inviteUri)
                            .set('Authorization', loginResponse.headers.authorization);
                        expect(inviteResponse.body.invite).toEqual({
                            uuid: expect.toBeUuid(),
                            inviter: 'inviter@gmail.com',
                            invitee: 'invitee@gmail.com',
                            exp: expect.any(Number),
                            status: 'ACCEPTED'
                        });
                        const sessionResponse = await (0, supertest_1.default)(app)
                            .get(sessionUri)
                            .set('Authorization', loginResponse.headers.authorization);
                        expect(sessionResponse.statusCode).toBe(200);
                    });
                });
            });
        });
    });
});
