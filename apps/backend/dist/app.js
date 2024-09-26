"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const resolve_routers_1 = require("@/user/resolve-routers");
const jose_1 = require("jose");
const create_server_side_web_socket_1 = __importDefault(require("./create-server-side-web-socket"));
const invite_service_d_1 = require("./invite/invite-service.d");
const create_dispatch_notification_1 = __importDefault(require("./notification/create-dispatch-notification"));
const rxjs_1 = require("rxjs");
const create_invite_event_listener_1 = __importDefault(require("./invite/create-invite-event-listener"));
const createAuthenticationMiddleware = (privateKey) => async (req, res, next) => {
    const authorizationField = req.headers.authorization;
    if (authorizationField) {
        try {
            const { payload } = await (0, jose_1.jwtDecrypt)(authorizationField.split(' ')[1], privateKey);
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
};
const createExternalEventPublisher = (serverSocket) => {
    const dispatchNotification = (0, create_dispatch_notification_1.default)(serverSocket);
    return (eventDetails) => {
        let type = eventDetails.type;
        if (type === invite_service_d_1.InviteEvents.INVITATION_CREATED) {
            type = 'invite_received';
        }
        dispatchNotification({
            ...eventDetails,
            type
        });
        return Promise.resolve();
    };
};
const appFactory = ({ stage, keySet, internalEventPublisher, internalEventSubscriber = new rxjs_1.Subject() }) => {
    const app = (0, express_1.default)();
    (0, create_server_side_web_socket_1.default)(app, '/notification', keySet.privateKey);
    (0, create_invite_event_listener_1.default)(internalEventSubscriber, (0, create_dispatch_notification_1.default)(app.serverSocket));
    const routers = (0, resolve_routers_1.resolveRouters)({
        stage,
        keySet,
        authority: `ws://localhost:${app.port}`,
        internalEventPublisher
    });
    app.use(express_1.default.json());
    app.use(createAuthenticationMiddleware(keySet.privateKey));
    app.use('/user', routers[resolve_routers_1.RouterTypes.userRouter]);
    app.use('/invite', routers[resolve_routers_1.RouterTypes.inviteRouter]);
    app.use('/session', routers[resolve_routers_1.RouterTypes.sessionRouter]);
    return app;
};
exports.default = appFactory;
