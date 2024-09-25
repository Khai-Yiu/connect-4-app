var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import http from 'http';
import { Server } from 'socket.io';
import { jwtDecrypt } from 'jose';
const createServerSideWebSocket = (app, path, privateKey) => {
    const httpServer = http.createServer(app).unref();
    const io = new Server(httpServer);
    httpServer.listen();
    app.port = httpServer.address().port;
    app.serverSocket = io;
    io.of(path).on('connection', (socket) => __awaiter(void 0, void 0, void 0, function* () {
        const { payload: { username } } = yield jwtDecrypt(socket.handshake.auth.token, privateKey);
        socket.join(username);
    }));
};
export default createServerSideWebSocket;
