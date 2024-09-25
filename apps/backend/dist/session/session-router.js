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
import halson from 'halson';
const createRetrieveSessionRequestHandler = (sessionService, userService) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { uuid, inviter, invitee, status } = yield sessionService.getSession(req.params.sessionUuid);
    const { email: inviterEmail } = yield userService.getUserDetailsByUuid(inviter.uuid);
    const { email: inviteeEmail } = yield userService.getUserDetailsByUuid(invitee.uuid);
    res.status(200).json(halson({
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
});
const sessionRouterFactory = (sessionService, userService) => {
    const sessionRouter = express.Router();
    sessionRouter.get('/:sessionUuid', createRetrieveSessionRequestHandler(sessionService, userService));
    return sessionRouter;
};
export default sessionRouterFactory;
