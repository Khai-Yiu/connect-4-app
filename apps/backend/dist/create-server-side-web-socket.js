"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const jose_1 = require("jose");
const createServerSideWebSocket = (app, path, privateKey) => {
    const httpServer = http_1.default.createServer(app).unref();
    const io = new socket_io_1.Server(httpServer);
    httpServer.listen();
    app.port = httpServer.address().port;
    app.serverSocket = io;
    io.of(path).on('connection', async (socket) => {
        const { payload: { username } } = await (0, jose_1.jwtDecrypt)(socket.handshake.auth.token, privateKey);
        socket.join(username);
    });
};
exports.default = createServerSideWebSocket;
