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
import { generateKeyPair } from 'jose';
import { io as ioc } from 'socket.io-client';
import TestFixture from '@/test-fixture/test-fixture';
import { Subject } from 'rxjs';
describe('invite-notification-integration', () => {
    let app;
    let port;
    let socketServer;
    let testFixture;
    let internalEventPublisher;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        const jwtKeyPair = generateKeyPair('RS256');
        const messageSubject = new Subject();
        internalEventPublisher = jest.fn((content) => Promise.resolve(messageSubject.next(content)));
        app = appFactory({
            stage: 'TEST',
            keySet: yield jwtKeyPair,
            internalEventPublisher,
            internalEventSubscriber: messageSubject
        });
        port = app.port;
        socketServer = app.serverSocket;
        testFixture = new TestFixture(app);
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        socketServer.close();
    }));
    describe('given a user is logged in', () => {
        describe('and connected to the notification service', () => {
            let inviteeSocket;
            let inviteePromise;
            beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
                let resolveInviteeSocketConnects;
                const inviteeSocketConnectedPromise = new Promise((resolve) => {
                    resolveInviteeSocketConnects = resolve;
                });
                let resolveInviteePromise;
                inviteePromise = new Promise((resolve) => {
                    resolveInviteePromise = resolve;
                });
                yield testFixture
                    .createUser('player1@gmail.com', 'Hello123')
                    .createUser('player2@gmail.com', 'Hello123')
                    .login('player1@gmail.com', 'Hello123')
                    .login('player2@gmail.com', 'Hello123')
                    .run();
                const { body: { links: { notifications } }, headers: { authorization: inviteeAuth } } = testFixture.getResponses(3);
                const inviteeSocket = ioc(notifications, {
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
                yield inviteeSocketConnectedPromise;
            }));
            describe('when another user sends them an invite', () => {
                it('they receive a notification', () => __awaiter(void 0, void 0, void 0, function* () {
                    yield testFixture
                        .createInvite('player1@gmail.com', 'player2@gmail.com')
                        .run();
                    return expect(inviteePromise).resolves.toEqual({
                        inviter: 'player1@gmail.com',
                        invitee: 'player2@gmail.com',
                        exp: expect.any(Number),
                        uuid: expect.toBeUuid(),
                        status: 'PENDING'
                    });
                }));
            });
        });
    });
});
