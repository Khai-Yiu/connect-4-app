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
const gameUriRegex = /^\/game\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
const sessionUuidRegex = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}/;
describe('session-integration', () => {
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
    describe('retrieving a session', () => {
        describe('given a session exists', () => {
            it('retrieves the session', async () => {
                await testFixture
                    .createUser('inviter@gmail.com', 'Hello123')
                    .createUser('invitee@gmail.com', 'Hello123')
                    .login('inviter@gmail.com', 'Hello123')
                    .login('invitee@gmail.com', 'Hello123')
                    .createInvite('inviter@gmail.com', 'invitee@gmail.com')
                    .getReceivedInvites('invitee@gmail.com')
                    .acceptInvite('invitee@gmail.com')
                    .run();
                const loginResponse = testFixture.getResponses(3);
                const acceptInviteResponse = testFixture.getResponses(6);
                const { href: sessionUri } = (0, halson_1.default)(acceptInviteResponse.body).getLink('related', { href: '' });
                const sessionUuid = sessionUri.match(sessionUuidRegex)[0];
                const response = await (0, supertest_1.default)(app)
                    .get(sessionUri)
                    .set('Authorization', loginResponse.headers.authorization);
                expect(response.statusCode).toBe(200);
                expect(response.body).toEqual({
                    sessionUuid,
                    inviter: 'inviter@gmail.com',
                    invitee: 'invitee@gmail.com',
                    status: 'IN_PROGRESS',
                    _links: {
                        self: {
                            href: sessionUri
                        },
                        startGame: {
                            href: `/session/${sessionUuid}/game`,
                            method: 'POST'
                        },
                        leave: {
                            href: `/session/${sessionUuid}/leave`,
                            method: 'GET'
                        }
                    }
                });
            });
        });
    });
});
