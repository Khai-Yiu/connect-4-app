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
const createGetInviteRequestHandler = (inviteService) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const inviteDetails = yield inviteService.getInvite(req.params.inviteUuid);
    res.status(200).send({ invite: inviteDetails });
});
const createInviteAcceptMiddleware = (inviteService) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const sessionUuid = yield inviteService.acceptInvite(req.params.inviteUuid);
    res.status(200).send(halson({
        _links: {
            related: [{ href: `/session/${sessionUuid}` }]
        }
    }).addLink('self', `/invite/${req.params.inviteUuid}`));
});
const createGetReceivedInvitesRequestHandler = (inviteService) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const email = res.locals.claims.email;
    const invites = yield inviteService.getReceivedInvites(email);
    res.status(201).send({
        invites: invites.map((invite) => halson(Object.assign(Object.assign({}, invite), { _links: {
                accept: {
                    href: `/invite/${invite.uuid}/accept`,
                    method: 'POST'
                },
                decline: {
                    href: `/invite/${invite.uuid}/decline`,
                    method: 'POST'
                }
            } })))
    });
});
const createCreateInvitationRequestHandler = (inviteService) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { inviter, invitee } = req.body;
    yield inviteService
        .create({
        invitee,
        inviter
    })
        .then(({ uuid, exp, status }) => {
        const invitationDetails = {
            uuid,
            inviter,
            invitee,
            exp,
            status
        };
        res.status(201).send({ invite: invitationDetails });
    })
        .catch((error) => res.status(403).send({ errors: [error.message] }));
    next();
});
const createInviteAuthorizationMiddleware = (req, res, next) => {
    const { inviter } = req.body;
    if (inviter === res.locals.claims.email) {
        next();
    }
    else {
        res.status(401).send({
            errors: ['You can not send an invite as another user.']
        });
    }
};
const authorizeRequest = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res.locals.claims.email
        ? next()
        : res.status(401).send({
            errors: ['You must be logged in to send an invite.']
        });
});
const inviteRouterFactory = (inviteService) => {
    const inviteRouter = express.Router();
    inviteRouter.use(authorizeRequest);
    inviteRouter.post('/', createInviteAuthorizationMiddleware, createCreateInvitationRequestHandler(inviteService));
    inviteRouter.get('/inbox', createGetReceivedInvitesRequestHandler(inviteService));
    inviteRouter.post('/:inviteUuid/accept', createInviteAcceptMiddleware(inviteService));
    inviteRouter.get('/:inviteUuid', createGetInviteRequestHandler(inviteService));
    return inviteRouter;
};
export default inviteRouterFactory;
