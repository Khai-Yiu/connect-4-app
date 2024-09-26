"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const halson_1 = __importDefault(require("halson"));
const createRetrieveSessionRequestHandler = (sessionService, userService) => async (req, res, next) => {
    const { uuid, inviter, invitee, status } = await sessionService.getSession(req.params.sessionUuid);
    const { email: inviterEmail } = await userService.getUserDetailsByUuid(inviter.uuid);
    const { email: inviteeEmail } = await userService.getUserDetailsByUuid(invitee.uuid);
    res.status(200).json((0, halson_1.default)({
        sessionUuid: uuid,
        inviter: inviterEmail,
        invitee: inviteeEmail,
        status
    })
        .addLink('self', req.originalUrl)
        .addLink('startGame', {
        href: `/session/${uuid}/game`,
        // @ts-ignore
        method: 'POST'
    })
        .addLink('leave', {
        href: `/session/${uuid}/leave`,
        // @ts-ignore
        method: 'GET'
    }));
};
const sessionRouterFactory = (sessionService, userService) => {
    const sessionRouter = express_1.default.Router();
    sessionRouter.get('/:sessionUuid', createRetrieveSessionRequestHandler(sessionService, userService));
    return sessionRouter;
};
exports.default = sessionRouterFactory;
