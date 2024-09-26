"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("@/app"));
const jose_1 = require("jose");
const socket_io_client_1 = require("socket.io-client");
const test_fixture_1 = __importDefault(require("@/test-fixture/test-fixture"));
const rxjs_1 = require("rxjs");
describe('invite-notification-integration', () => {
    let app;
    let port;
    let socketServer;
    let testFixture;
    let internalEventPublisher;
    beforeAll(async () => {
        const jwtKeyPair = (0, jose_1.generateKeyPair)('RS256');
        const messageSubject = new rxjs_1.Subject();
        internalEventPublisher = jest.fn((content) => Promise.resolve(messageSubject.next(content)));
        app = (0, app_1.default)({
            stage: 'TEST',
            keySet: await jwtKeyPair,
            internalEventPublisher,
            internalEventSubscriber: messageSubject
        });
        port = app.port;
        socketServer = app.serverSocket;
        testFixture = new test_fixture_1.default(app);
    });
    afterAll(async () => {
        socketServer.close();
    });
    describe('given a user is logged in', () => {
        describe('and connected to the notification service', () => {
            let inviteeSocket;
            let inviteePromise;
            beforeEach(async () => {
                let resolveInviteeSocketConnects;
                const inviteeSocketConnectedPromise = new Promise((resolve) => {
                    resolveInviteeSocketConnects = resolve;
                });
                let resolveInviteePromise;
                inviteePromise = new Promise((resolve) => {
                    resolveInviteePromise = resolve;
                });
                await testFixture
                    .createUser('player1@gmail.com', 'Hello123')
                    .createUser('player2@gmail.com', 'Hello123')
                    .login('player1@gmail.com', 'Hello123')
                    .login('player2@gmail.com', 'Hello123')
                    .run();
                const { body: { links: { notifications } }, headers: { authorization: inviteeAuth } } = testFixture.getResponses(3);
                const inviteeSocket = (0, socket_io_client_1.io)(notifications, {
                    auth: {
                        token: inviteeAuth.split(' ')[1]
                    }
                });
                inviteeSocket.on('connect', () => {
                    resolveInviteeSocketConnects('Connected');
                });
                inviteeSocket.on('invite_received', (inviteReceivedMessage) => {
                    resolveInviteePromise(inviteReceivedMessage);
                    inviteeSocket.disconnect();
                });
                inviteeSocket.connect();
                await inviteeSocketConnectedPromise;
            });
            describe('when another user sends them an invite', () => {
                it('they receive a notification', async () => {
                    await testFixture
                        .createInvite('player1@gmail.com', 'player2@gmail.com')
                        .run();
                    return expect(inviteePromise).resolves.toEqual({
                        inviter: 'player1@gmail.com',
                        invitee: 'player2@gmail.com',
                        exp: expect.any(Number),
                        uuid: expect.toBeUuid(),
                        status: 'PENDING'
                    });
                });
            });
        });
    });
});
