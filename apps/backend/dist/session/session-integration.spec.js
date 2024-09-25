var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import appFactory from '@/app';
import TestFixture from '@/test-fixture/test-fixture';
import { generateKeyPair } from 'jose';
import request from 'supertest';
import halson from 'halson';
const gameUriRegex = /^\/game\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
const sessionUuidRegex = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}/;
describe('session-integration', () => {
    let app;
    let jwtKeyPair;
    let testFixture;
    let currentDateInMilliseconds;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        jwtKeyPair = yield generateKeyPair('RS256');
    }));
    beforeEach(() => {
        jest.useFakeTimers({
            doNotFake: ['setImmediate']
        });
        currentDateInMilliseconds = Date.now();
        jest.setSystemTime(currentDateInMilliseconds);
        app = appFactory({
            stage: 'TEST',
            keySet: jwtKeyPair
        });
        testFixture = new TestFixture(app);
    });
    afterEach(() => {
        jest.useRealTimers();
    });
    describe('retrieving a session', () => {
        describe('given a session exists', () => {
            it('retrieves the session', () => __awaiter(void 0, void 0, void 0, function* () {
                yield testFixture
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
                const { href: sessionUri } = halson(acceptInviteResponse.body).getLink('related', { href: '' });
                const sessionUuid = sessionUri.match(sessionUuidRegex)[0];
                const response = yield request(app)
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
            }));
        });
    });
});
