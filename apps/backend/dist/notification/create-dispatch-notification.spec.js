"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const create_dispatch_notification_1 = __importDefault(require("@/notification/create-dispatch-notification"));
const test_fixture_1 = __importDefault(require("../test-fixture/test-fixture"));
const socket_io_client_1 = require("socket.io-client");
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const jose_1 = require("jose");
const app_1 = __importDefault(require("../app"));
let testFixture;
let jwtKeyPair;
let app;
let httpServer;
let server;
let connectionAddress;
let callCreatedDispatchNotificationWhenPromiseResolves = () => { };
beforeEach(async () => {
    jwtKeyPair = (0, jose_1.generateKeyPair)('RS256');
    app = (0, app_1.default)({
        stage: 'TEST',
        keySet: await jwtKeyPair
    });
    testFixture = new test_fixture_1.default(app);
    httpServer = http_1.default.createServer(app);
    server = new socket_io_1.Server(httpServer);
    httpServer.listen(() => {
        const port = httpServer.address().port;
        connectionAddress = `http://localhost:${port}/notification`;
    });
    server.of('/notification').on('connection', async (socket) => {
        const token = socket.handshake.auth.token;
        const { privateKey } = await jwtKeyPair;
        const { payload } = await (0, jose_1.jwtDecrypt)(token, privateKey);
        const { username } = payload;
        callCreatedDispatchNotificationWhenPromiseResolves('Resolved');
        socket.join(username);
    });
});
afterEach(() => {
    server.close();
    httpServer.close();
    httpServer.removeAllListeners();
});
describe('create-dispatch-notification', () => {
    describe('given a user connected to a socket', () => {
        let recipientSocket;
        let thirdPartySocket;
        afterEach(() => {
            if (recipientSocket instanceof socket_io_client_1.Socket) {
                recipientSocket.disconnect();
            }
            if (thirdPartySocket instanceof socket_io_client_1.Socket) {
                thirdPartySocket.disconnect();
            }
        });
        describe('and no other users are connected', () => {
            describe('when a message is dispatched to the user', () => {
                it('the user receives the message', async () => {
                    const singleUserPromise = new Promise((resolve) => {
                        callCreatedDispatchNotificationWhenPromiseResolves =
                            resolve;
                    });
                    let userResolver;
                    const userPromise = new Promise((resolve) => {
                        userResolver = resolve;
                    });
                    await testFixture
                        .createUser('player1@gmail.com', 'Hello123')
                        .login('player1@gmail.com', 'Hello123')
                        .run();
                    const recipientResponse = testFixture.getResponses(1);
                    recipientSocket = (0, socket_io_client_1.io)(connectionAddress, {
                        auth: {
                            token: recipientResponse.headers.authorization.split(' ')[1]
                        }
                    });
                    recipientSocket.connect();
                    recipientSocket.on('event', (details) => {
                        userResolver(details);
                    });
                    await singleUserPromise;
                    const dispatchNotification = (0, create_dispatch_notification_1.default)(server);
                    dispatchNotification({
                        recipient: 'player1@gmail.com',
                        type: 'event',
                        payload: {
                            message: 'Hello'
                        }
                    });
                    await expect(userPromise).resolves.toEqual({
                        message: 'Hello'
                    });
                });
            });
            describe('when multiple messages are dispatched to the user', () => {
                it('the user receives all messages', async () => {
                    const singleUserPromise = new Promise((resolve) => {
                        callCreatedDispatchNotificationWhenPromiseResolves =
                            resolve;
                    });
                    let resolveUserReceiveMessagesPromise;
                    const userReceivedMessagesPromise = new Promise((resolve) => {
                        resolveUserReceiveMessagesPromise = resolve;
                    });
                    await testFixture
                        .createUser('player1@gmail.com', 'Hello123')
                        .login('player1@gmail.com', 'Hello123')
                        .run();
                    const recipientResponse = testFixture.getResponses(1);
                    recipientSocket = (0, socket_io_client_1.io)(connectionAddress, {
                        auth: {
                            token: recipientResponse.headers.authorization.split(' ')[1]
                        }
                    });
                    recipientSocket.connect();
                    const messages = [];
                    let messagesReceived = 0;
                    recipientSocket.on('event', (details) => {
                        messagesReceived++;
                        messages.push(details);
                        if (messagesReceived == 2) {
                            resolveUserReceiveMessagesPromise(messages);
                        }
                    });
                    await singleUserPromise;
                    const dispatchNotification = (0, create_dispatch_notification_1.default)(server);
                    dispatchNotification({
                        recipient: 'player1@gmail.com',
                        type: 'event',
                        payload: {
                            message: 'Hello'
                        }
                    });
                    dispatchNotification({
                        recipient: 'player1@gmail.com',
                        type: 'event',
                        payload: {
                            message: 'Bye'
                        }
                    });
                    await expect(userReceivedMessagesPromise).resolves.toEqual([
                        {
                            message: 'Hello'
                        },
                        {
                            message: 'Bye'
                        }
                    ]);
                });
            });
        });
        describe('and another user is connected to a socket', () => {
            describe('when a message is dispatched to the other user', () => {
                it('does not send the message to the user who is not the intended recipient', async () => {
                    const firstUserConnectPromise = new Promise((resolve) => {
                        callCreatedDispatchNotificationWhenPromiseResolves =
                            resolve;
                    });
                    let userResolver;
                    const userPromise = new Promise((resolve) => {
                        userResolver = resolve;
                    });
                    await testFixture
                        .createUser('player1@gmail.com', 'Hello123')
                        .createUser('thirdParty@gmail.com', 'Hello123')
                        .login('player1@gmail.com', 'Hello123')
                        .login('thirdParty@gmail.com', 'Hello123')
                        .run();
                    const recipientResponse = testFixture.getResponses(2);
                    const thirdPartyResponse = testFixture.getResponses(3);
                    recipientSocket = (0, socket_io_client_1.io)(connectionAddress, {
                        auth: {
                            token: recipientResponse.headers.authorization.split(' ')[1]
                        }
                    });
                    thirdPartySocket = (0, socket_io_client_1.io)(connectionAddress, {
                        auth: {
                            token: thirdPartyResponse.headers.authorization.split(' ')[1]
                        }
                    });
                    recipientSocket.on('event', (details) => {
                        userResolver(details);
                    });
                    await firstUserConnectPromise;
                    const secondUserConnectPromise = new Promise((resolve) => {
                        callCreatedDispatchNotificationWhenPromiseResolves =
                            resolve;
                    });
                    thirdPartySocket.on('event', (details) => {
                        expect(true).toBeFalsy();
                    });
                    await secondUserConnectPromise;
                    const dispatchNotification = (0, create_dispatch_notification_1.default)(server);
                    dispatchNotification({
                        recipient: 'player1@gmail.com',
                        type: 'event',
                        payload: {
                            message: 'Hello'
                        }
                    });
                    await expect(userPromise).resolves.toEqual({
                        message: 'Hello'
                    });
                });
            });
            describe('when a message is dispatched to each user', () => {
                let player1Socket;
                let player2Socket;
                afterEach(() => {
                    player1Socket.disconnect();
                    player2Socket.disconnect();
                });
                it('each user receives a message', async () => {
                    const firstUserConnectPromise = new Promise((resolve) => {
                        callCreatedDispatchNotificationWhenPromiseResolves =
                            resolve;
                    });
                    let resolvePlayer1ReceivesMessagePromise;
                    const player1ReceivedMessagePromise = new Promise((resolve) => {
                        resolvePlayer1ReceivesMessagePromise = resolve;
                    });
                    let resolvePlayer2ReceivesMessagePromise;
                    const player2ReceivedMessagePromise = new Promise((resolve) => {
                        resolvePlayer2ReceivesMessagePromise = resolve;
                    });
                    await testFixture
                        .createUser('player1@gmail.com', 'Hello123')
                        .createUser('player2@gmail.com', 'Hello123')
                        .login('player1@gmail.com', 'Hello123')
                        .login('player2@gmail.com', 'Hello123')
                        .run();
                    const player1Response = testFixture.getResponses(2);
                    const player2Response = testFixture.getResponses(3);
                    player1Socket = (0, socket_io_client_1.io)(connectionAddress, {
                        auth: {
                            token: player1Response.headers.authorization.split(' ')[1]
                        }
                    });
                    player2Socket = (0, socket_io_client_1.io)(connectionAddress, {
                        auth: {
                            token: player2Response.headers.authorization.split(' ')[1]
                        }
                    });
                    player1Socket.on('event', (details) => {
                        resolvePlayer1ReceivesMessagePromise(details);
                    });
                    await firstUserConnectPromise;
                    const secondUserConnectPromise = new Promise((resolve) => {
                        callCreatedDispatchNotificationWhenPromiseResolves =
                            resolve;
                    });
                    player2Socket.on('event', (details) => {
                        resolvePlayer2ReceivesMessagePromise(details);
                    });
                    await secondUserConnectPromise;
                    const dispatchNotification = (0, create_dispatch_notification_1.default)(server);
                    dispatchNotification({
                        recipient: 'player1@gmail.com',
                        type: 'event',
                        payload: {
                            message: 'Hello player 1'
                        }
                    });
                    dispatchNotification({
                        recipient: 'player2@gmail.com',
                        type: 'event',
                        payload: {
                            message: 'Hello player 2'
                        }
                    });
                    await expect(player1ReceivedMessagePromise).resolves.toEqual({
                        message: 'Hello player 1'
                    });
                    await expect(player2ReceivedMessagePromise).resolves.toEqual({
                        message: 'Hello player 2'
                    });
                });
            });
        });
        describe('and a message is dispatched to a non-existent recipient', () => {
            describe('when a message is dispatched to the user', () => {
                it('only the user receives a message', async () => {
                    const singleUserPromise = new Promise((resolve) => {
                        callCreatedDispatchNotificationWhenPromiseResolves =
                            resolve;
                    });
                    let resolveUserReceivesMessagePromise;
                    const userReceivedMessagePromise = new Promise((resolve) => {
                        resolveUserReceivesMessagePromise = resolve;
                    });
                    await testFixture
                        .createUser('player1@gmail.com', 'Hello123')
                        .login('player1@gmail.com', 'Hello123')
                        .run();
                    const recipientResponse = testFixture.getResponses(1);
                    recipientSocket = (0, socket_io_client_1.io)(connectionAddress, {
                        auth: {
                            token: recipientResponse.headers.authorization.split(' ')[1]
                        }
                    });
                    recipientSocket.connect();
                    recipientSocket.on('event', (details) => {
                        resolveUserReceivesMessagePromise(details);
                    });
                    await singleUserPromise;
                    const dispatchNotification = (0, create_dispatch_notification_1.default)(server);
                    dispatchNotification({
                        recipient: 'userdoesnotexist@game.com',
                        type: 'event',
                        payload: {
                            message: 'Hello'
                        }
                    });
                    dispatchNotification({
                        recipient: 'player1@gmail.com',
                        type: 'event',
                        payload: {
                            message: 'Hello'
                        }
                    });
                    await expect(userReceivedMessagePromise).resolves.toEqual({
                        message: 'Hello'
                    });
                });
            });
        });
    });
});
