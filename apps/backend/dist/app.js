var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from 'express';
import { resolveRouters, RouterTypes } from '@/user/resolve-routers';
import { jwtDecrypt } from 'jose';
import createServerSideWebSocket from './create-server-side-web-socket';
import { InviteEvents } from './invite/invite-service.d';
import createDispatchNotification from './notification/create-dispatch-notification';
import { Subject } from 'rxjs';
import createInviteEventListener from './invite/create-invite-event-listener';
const createAuthenticationMiddleware = (privateKey) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authorizationField = req.headers.authorization;
    if (authorizationField) {
        try {
            const { payload } = yield jwtDecrypt(authorizationField.split(' ')[1], privateKey);
            res.locals.claims = {
                email: payload.username
            };
        }
        catch (error) {
            res.locals.claims = {
                email: undefined
            };
        }
    }
    else {
        res.locals.claims = {
            email: undefined
        };
    }
    next();
});
const createExternalEventPublisher = (serverSocket) => {
    const dispatchNotification = createDispatchNotification(serverSocket);
    return (eventDetails) => {
        let type = eventDetails.type;
        if (type === InviteEvents.INVITATION_CREATED) {
            type = 'invite_received';
        }
        dispatchNotification(Object.assign(Object.assign({}, eventDetails), { type }));
        return Promise.resolve();
    };
};
const appFactory = ({ stage, keySet, internalEventPublisher, internalEventSubscriber = new Subject() }) => {
    const app = express();
    createServerSideWebSocket(app, '/notification', keySet.privateKey);
    createInviteEventListener(internalEventSubscriber, createDispatchNotification(app.serverSocket));
    const routers = resolveRouters({
        stage,
        keySet,
        authority: `ws://localhost:${app.port}`,
        internalEventPublisher
    });
    app.use(express.json());
    app.use(createAuthenticationMiddleware(keySet.privateKey));
    app.use('/user', routers[RouterTypes.userRouter]);
    app.use('/invite', routers[RouterTypes.inviteRouter]);
    app.use('/session', routers[RouterTypes.sessionRouter]);
    return app;
};
export default appFactory;
