"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("@/app"));
const test_fixture_1 = __importDefault(require("@/test-fixture/test-fixture"));
const jose_1 = require("jose");
const socket_io_client_1 = require("socket.io-client");
const create_dispatch_notification_1 = __importDefault(require("./create-dispatch-notification"));
describe('notification-integration', () => {
    let app;
    let port;
    let server;
    const jwtKeyPair = (0, jose_1.generateKeyPair)('RS256');
    let testFixture;
    beforeEach(async () => {
        app = (0, app_1.default)({
            stage: 'TEST',
            keySet: await jwtKeyPair,
            internalEventPublisher: (content) => Promise.resolve()
        });
        port = app.port;
        server = app.serverSocket;
        testFixture = new test_fixture_1.default(app);
    });
    describe('given the user exists and is logged in', () => {
        describe('when the user connects to the notification endpoint', () => {
            it('the connection succeeds', async () => {
                let resolveUserPromise;
                const userPromise = new Promise((resolve) => {
                    resolveUserPromise = resolve;
                });
                await testFixture
                    .createUser('player1@gmail.com', 'Hello123')
                    .login('player1@gmail.com', 'Hello123')
                    .run();
                const { body: { links: { notifications } }, headers: { authorization } } = testFixture.getResponses(1);
                const notificationSocket = (0, socket_io_client_1.io)(`${notifications}`, {
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
            });
        });
        describe('and they are connected to the notification endpoint', () => {
            describe('when a notification is dispatched to the user', () => {
                it('they receive the notification', async () => {
                    let resolveUserConnectedPromise;
                    const userConnectedPromise = new Promise((resolve) => {
                        resolveUserConnectedPromise = resolve;
                    });
                    let resolveUserNotificationPromise;
                    const userReceivedNotificationPromise = new Promise((resolve) => {
                        resolveUserNotificationPromise = resolve;
                    });
                    await testFixture
                        .createUser('player1@gmail.com', 'Hello123')
                        .login('player1@gmail.com', 'Hello123')
                        .run();
                    const { body: { links: { notifications } }, headers: { authorization } } = testFixture.getResponses(1);
                    const notificationSocket = (0, socket_io_client_1.io)(notifications, {
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
                    await userConnectedPromise;
                    const dispatchNotification = (0, create_dispatch_notification_1.default)(server);
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
                });
            });
            describe('when a notification is dispatched to another user', () => {
                it('only the designated recipient is notified', async () => {
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
                    await testFixture
                        .createUser('player1@gmail.com', 'Hello123')
                        .createUser('thirdParty@gmail.com', 'Hello123')
                        .login('player1@gmail.com', 'Hello123')
                        .login('thirdParty@gmail.com', 'Hello123')
                        .run();
                    const { body: { links: { notifications } }, headers: { authorization: userAuth } } = testFixture.getResponses(2);
                    const { headers: { authorization: thirdPartyAuth } } = testFixture.getResponses(3);
                    const recipientSocket = (0, socket_io_client_1.io)(notifications, {
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
                    const thirdPartySocket = (0, socket_io_client_1.io)(notifications, {
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
                    await userConnectedPromise;
                    await thirdPartyConnectedPromise;
                    const dispatchNotification = (0, create_dispatch_notification_1.default)(server);
                    dispatchNotification({
                        recipient: 'player1@gmail.com',
                        type: 'event',
                        payload: {
                            message: 'Hello'
                        }
                    });
                    await expect(userReceivedNotificationPromise).resolves.toEqual({
                        message: 'Hello'
                    });
                    recipientSocket.disconnect();
                    thirdPartySocket.disconnect();
                });
            });
        });
    });
});
