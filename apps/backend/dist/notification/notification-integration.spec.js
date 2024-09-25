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
import { io as ioc } from 'socket.io-client';
import createDispatchNotification from './create-dispatch-notification';
describe('notification-integration', () => {
    let app;
    let port;
    let server;
    const jwtKeyPair = generateKeyPair('RS256');
    let testFixture;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        app = appFactory({
            stage: 'TEST',
            keySet: yield jwtKeyPair,
            internalEventPublisher: (content) => Promise.resolve()
        });
        port = app.port;
        server = app.serverSocket;
        testFixture = new TestFixture(app);
    }));
    describe('given the user exists and is logged in', () => {
        describe('when the user connects to the notification endpoint', () => {
            it('the connection succeeds', () => __awaiter(void 0, void 0, void 0, function* () {
                let resolveUserPromise;
                const userPromise = new Promise((resolve) => {
                    resolveUserPromise = resolve;
                });
                yield testFixture
                    .createUser('player1@gmail.com', 'Hello123')
                    .login('player1@gmail.com', 'Hello123')
                    .run();
                const { body: { links: { notifications } }, headers: { authorization } } = testFixture.getResponses(1);
                const notificationSocket = ioc(`${notifications}`, {
                    auth: {
                        token: authorization.split(' ')[1]
                    }
                });
                notificationSocket.connect();
                notificationSocket.on('connect', () => {
                    resolveUserPromise('Connected');
                    notificationSocket.disconnect();
                });
                return expect(userPromise).resolves.toBe('Connected');
            }));
        });
        describe('and they are connected to the notification endpoint', () => {
            describe('when a notification is dispatched to the user', () => {
                it('they receive the notification', () => __awaiter(void 0, void 0, void 0, function* () {
                    let resolveUserConnectedPromise;
                    const userConnectedPromise = new Promise((resolve) => {
                        resolveUserConnectedPromise = resolve;
                    });
                    let resolveUserNotificationPromise;
                    const userReceivedNotificationPromise = new Promise((resolve) => {
                        resolveUserNotificationPromise = resolve;
                    });
                    yield testFixture
                        .createUser('player1@gmail.com', 'Hello123')
                        .login('player1@gmail.com', 'Hello123')
                        .run();
                    const { body: { links: { notifications } }, headers: { authorization } } = testFixture.getResponses(1);
                    const notificationSocket = ioc(notifications, {
                        auth: {
                            token: authorization.split(' ')[1]
                        }
                    });
                    notificationSocket.connect();
                    notificationSocket.on('connect', () => {
                        resolveUserConnectedPromise('Connected');
                    });
                    notificationSocket.on('event', (details) => {
                        resolveUserNotificationPromise(details);
                        notificationSocket.disconnect();
                    });
                    yield userConnectedPromise;
                    const dispatchNotification = createDispatchNotification(server);
                    dispatchNotification({
                        recipient: 'player1@gmail.com',
                        type: 'event',
                        payload: {
                            message: 'Hello'
                        }
                    });
                    return expect(userReceivedNotificationPromise).resolves.toEqual({
                        message: 'Hello'
                    });
                }));
            });
            describe('when a notification is dispatched to another user', () => {
                it('only the designated recipient is notified', () => __awaiter(void 0, void 0, void 0, function* () {
                    let resolveUserConnectedPromise;
                    const userConnectedPromise = new Promise((resolve) => {
                        resolveUserConnectedPromise = resolve;
                    });
                    let resolveThirdPartyConnectedPromise;
                    const thirdPartyConnectedPromise = new Promise((resolve) => {
                        resolveThirdPartyConnectedPromise = resolve;
                    });
                    let resolveUserNotificationPromise;
                    const userReceivedNotificationPromise = new Promise((resolve) => {
                        resolveUserNotificationPromise = resolve;
                    });
                    let resolveThirdPartyUserNotificationPromise;
                    const thirdPartyUserReceivedReceivedNotificationPromise = new Promise((resolve) => {
                        resolveThirdPartyUserNotificationPromise = resolve;
                    });
                    yield testFixture
                        .createUser('player1@gmail.com', 'Hello123')
                        .createUser('thirdParty@gmail.com', 'Hello123')
                        .login('player1@gmail.com', 'Hello123')
                        .login('thirdParty@gmail.com', 'Hello123')
                        .run();
                    const { body: { links: { notifications } }, headers: { authorization: userAuth } } = testFixture.getResponses(2);
                    const { headers: { authorization: thirdPartyAuth } } = testFixture.getResponses(3);
                    const recipientSocket = ioc(notifications, {
                        auth: {
                            token: userAuth.split(' ')[1]
                        }
                    });
                    recipientSocket.on('connect', () => {
                        resolveUserConnectedPromise('Connected');
                    });
                    recipientSocket.connect();
                    recipientSocket.on('event', (details) => {
                        resolveUserNotificationPromise(details);
                    });
                    const thirdPartySocket = ioc(notifications, {
                        auth: {
                            token: thirdPartyAuth.split(' ')[1]
                        }
                    });
                    thirdPartySocket.on('connect', () => {
                        resolveThirdPartyConnectedPromise('Connected');
                    });
                    thirdPartySocket.connect();
                    thirdPartySocket.on('event', (details) => {
                        expect(true).toBeFalsy();
                    });
                    yield userConnectedPromise;
                    yield thirdPartyConnectedPromise;
                    const dispatchNotification = createDispatchNotification(server);
                    dispatchNotification({
                        recipient: 'player1@gmail.com',
                        type: 'event',
                        payload: {
                            message: 'Hello'
                        }
                    });
                    yield expect(userReceivedNotificationPromise).resolves.toEqual({
                        message: 'Hello'
                    });
                    recipientSocket.disconnect();
                    thirdPartySocket.disconnect();
                }));
            });
        });
    });
});
