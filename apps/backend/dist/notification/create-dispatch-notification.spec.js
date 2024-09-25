var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import createDispatchNotification from '@/notification/create-dispatch-notification';
import TestFixture from '../test-fixture/test-fixture';
import { io as ioc, Socket as ClientSocket } from 'socket.io-client';
import http from 'http';
import { Server } from 'socket.io';
import { generateKeyPair, jwtDecrypt } from 'jose';
import appFactory from '../app';
let testFixture;
let jwtKeyPair;
let app;
let httpServer;
let server;
let connectionAddress;
let callCreatedDispatchNotificationWhenPromiseResolves = () => { };
beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
    jwtKeyPair = generateKeyPair('RS256');
    app = appFactory({
        stage: 'TEST',
        keySet: yield jwtKeyPair
    });
    testFixture = new TestFixture(app);
    httpServer = http.createServer(app);
    server = new Server(httpServer);
    httpServer.listen(() => {
        const port = httpServer.address().port;
        connectionAddress = `http://localhost:${port}/notification`;
    });
    server.of('/notification').on('connection', (socket) => __awaiter(void 0, void 0, void 0, function* () {
        const token = socket.handshake.auth.token;
        const { privateKey } = yield jwtKeyPair;
        const { payload } = yield jwtDecrypt(token, privateKey);
        const { username } = payload;
        callCreatedDispatchNotificationWhenPromiseResolves('Resolved');
        socket.join(username);
    }));
}));
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
            if (recipientSocket instanceof ClientSocket) {
                recipientSocket.disconnect();
            }
            if (thirdPartySocket instanceof ClientSocket) {
                thirdPartySocket.disconnect();
            }
        });
        describe('and no other users are connected', () => {
            describe('when a message is dispatched to the user', () => {
                it('the user receives the message', () => __awaiter(void 0, void 0, void 0, function* () {
                    const singleUserPromise = new Promise((resolve) => {
                        callCreatedDispatchNotificationWhenPromiseResolves =
                            resolve;
                    });
                    let userResolver;
                    const userPromise = new Promise((resolve) => {
                        userResolver = resolve;
                    });
                    yield testFixture
                        .createUser('player1@gmail.com', 'Hello123')
                        .login('player1@gmail.com', 'Hello123')
                        .run();
                    const recipientResponse = testFixture.getResponses(1);
                    recipientSocket = ioc(connectionAddress, {
                        auth: {
                            token: recipientResponse.headers.authorization.split(' ')[1]
                        }
                    });
                    recipientSocket.connect();
                    recipientSocket.on('event', (details) => {
                        userResolver(details);
                    });
                    yield singleUserPromise;
                    const dispatchNotification = createDispatchNotification(server);
                    dispatchNotification({
                        recipient: 'player1@gmail.com',
                        type: 'event',
                        payload: {
                            message: 'Hello'
                        }
                    });
                    yield expect(userPromise).resolves.toEqual({
                        message: 'Hello'
                    });
                }));
            });
            describe('when multiple messages are dispatched to the user', () => {
                it('the user receives all messages', () => __awaiter(void 0, void 0, void 0, function* () {
                    const singleUserPromise = new Promise((resolve) => {
                        callCreatedDispatchNotificationWhenPromiseResolves =
                            resolve;
                    });
                    let resolveUserReceiveMessagesPromise;
                    const userReceivedMessagesPromise = new Promise((resolve) => {
                        resolveUserReceiveMessagesPromise = resolve;
                    });
                    yield testFixture
                        .createUser('player1@gmail.com', 'Hello123')
                        .login('player1@gmail.com', 'Hello123')
                        .run();
                    const recipientResponse = testFixture.getResponses(1);
                    recipientSocket = ioc(connectionAddress, {
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
                    yield singleUserPromise;
                    const dispatchNotification = createDispatchNotification(server);
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
                    yield expect(userReceivedMessagesPromise).resolves.toEqual([
                        {
                            message: 'Hello'
                        },
                        {
                            message: 'Bye'
                        }
                    ]);
                }));
            });
        });
        describe('and another user is connected to a socket', () => {
            describe('when a message is dispatched to the other user', () => {
                it('does not send the message to the user who is not the intended recipient', () => __awaiter(void 0, void 0, void 0, function* () {
                    const firstUserConnectPromise = new Promise((resolve) => {
                        callCreatedDispatchNotificationWhenPromiseResolves =
                            resolve;
                    });
                    let userResolver;
                    const userPromise = new Promise((resolve) => {
                        userResolver = resolve;
                    });
                    yield testFixture
                        .createUser('player1@gmail.com', 'Hello123')
                        .createUser('thirdParty@gmail.com', 'Hello123')
                        .login('player1@gmail.com', 'Hello123')
                        .login('thirdParty@gmail.com', 'Hello123')
                        .run();
                    const recipientResponse = testFixture.getResponses(2);
                    const thirdPartyResponse = testFixture.getResponses(3);
                    recipientSocket = ioc(connectionAddress, {
                        auth: {
                            token: recipientResponse.headers.authorization.split(' ')[1]
                        }
                    });
                    thirdPartySocket = ioc(connectionAddress, {
                        auth: {
                            token: thirdPartyResponse.headers.authorization.split(' ')[1]
                        }
                    });
                    recipientSocket.on('event', (details) => {
                        userResolver(details);
                    });
                    yield firstUserConnectPromise;
                    const secondUserConnectPromise = new Promise((resolve) => {
                        callCreatedDispatchNotificationWhenPromiseResolves =
                            resolve;
                    });
                    thirdPartySocket.on('event', (details) => {
                        expect(true).toBeFalsy();
                    });
                    yield secondUserConnectPromise;
                    const dispatchNotification = createDispatchNotification(server);
                    dispatchNotification({
                        recipient: 'player1@gmail.com',
                        type: 'event',
                        payload: {
                            message: 'Hello'
                        }
                    });
                    yield expect(userPromise).resolves.toEqual({
                        message: 'Hello'
                    });
                }));
            });
            describe('when a message is dispatched to each user', () => {
                let player1Socket;
                let player2Socket;
                afterEach(() => {
                    player1Socket.disconnect();
                    player2Socket.disconnect();
                });
                it('each user receives a message', () => __awaiter(void 0, void 0, void 0, function* () {
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
                    yield testFixture
                        .createUser('player1@gmail.com', 'Hello123')
                        .createUser('player2@gmail.com', 'Hello123')
                        .login('player1@gmail.com', 'Hello123')
                        .login('player2@gmail.com', 'Hello123')
                        .run();
                    const player1Response = testFixture.getResponses(2);
                    const player2Response = testFixture.getResponses(3);
                    player1Socket = ioc(connectionAddress, {
                        auth: {
                            token: player1Response.headers.authorization.split(' ')[1]
                        }
                    });
                    player2Socket = ioc(connectionAddress, {
                        auth: {
                            token: player2Response.headers.authorization.split(' ')[1]
                        }
                    });
                    player1Socket.on('event', (details) => {
                        resolvePlayer1ReceivesMessagePromise(details);
                    });
                    yield firstUserConnectPromise;
                    const secondUserConnectPromise = new Promise((resolve) => {
                        callCreatedDispatchNotificationWhenPromiseResolves =
                            resolve;
                    });
                    player2Socket.on('event', (details) => {
                        resolvePlayer2ReceivesMessagePromise(details);
                    });
                    yield secondUserConnectPromise;
                    const dispatchNotification = createDispatchNotification(server);
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
                    yield expect(player1ReceivedMessagePromise).resolves.toEqual({
                        message: 'Hello player 1'
                    });
                    yield expect(player2ReceivedMessagePromise).resolves.toEqual({
                        message: 'Hello player 2'
                    });
                }));
            });
        });
        describe('and a message is dispatched to a non-existent recipient', () => {
            describe('when a message is dispatched to the user', () => {
                it('only the user receives a message', () => __awaiter(void 0, void 0, void 0, function* () {
                    const singleUserPromise = new Promise((resolve) => {
                        callCreatedDispatchNotificationWhenPromiseResolves =
                            resolve;
                    });
                    let resolveUserReceivesMessagePromise;
                    const userReceivedMessagePromise = new Promise((resolve) => {
                        resolveUserReceivesMessagePromise = resolve;
                    });
                    yield testFixture
                        .createUser('player1@gmail.com', 'Hello123')
                        .login('player1@gmail.com', 'Hello123')
                        .run();
                    const recipientResponse = testFixture.getResponses(1);
                    recipientSocket = ioc(connectionAddress, {
                        auth: {
                            token: recipientResponse.headers.authorization.split(' ')[1]
                        }
                    });
                    recipientSocket.connect();
                    recipientSocket.on('event', (details) => {
                        resolveUserReceivesMessagePromise(details);
                    });
                    yield singleUserPromise;
                    const dispatchNotification = createDispatchNotification(server);
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
                    yield expect(userReceivedMessagePromise).resolves.toEqual({
                        message: 'Hello'
                    });
                }));
            });
        });
    });
});
