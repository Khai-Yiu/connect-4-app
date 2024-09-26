"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const halson_1 = __importDefault(require("halson"));
const createGetInviteRequestHandler = (inviteService) => async (req, res, next) => {
    const inviteDetails = await inviteService.getInvite(req.params.inviteUuid);
    res.status(200).send({ invite: inviteDetails });
};
const createInviteAcceptMiddleware = (inviteService) => async (req, res, next) => {
    const sessionUuid = await inviteService.acceptInvite(req.params.inviteUuid);
    res.status(200).send((0, halson_1.default)({
        _links: {
            related: [{ href: `/session/${sessionUuid}` }]
        }
    }).addLink('self', `/invite/${req.params.inviteUuid}`));
};
const createGetReceivedInvitesRequestHandler = (inviteService) => async (req, res, next) => {
    const email = res.locals.claims.email;
    const invites = await inviteService.getReceivedInvites(email);
    res.status(201).send({
        invites: invites.map((invite) => (0, halson_1.default)({
            ...invite,
            _links: {
                accept: {
                    href: `/invite/${invite.uuid}/accept`,
                    method: 'POST'
                },
                decline: {
                    href: `/invite/${invite.uuid}/decline`,
                    method: 'POST'
                }
            }
        }))
    });
};
const createCreateInvitationRequestHandler = (inviteService) => async (req, res, next) => {
    const { inviter, invitee } = req.body;
    await inviteService
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
};
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
const authorizeRequest = async (req, res, next) => {
    res.locals.claims.email
        ? next()
        : res.status(401).send({
            errors: ['You must be logged in to send an invite.']
        });
};
const inviteRouterFactory = (inviteService) => {
    const inviteRouter = express_1.default.Router();
    inviteRouter.use(authorizeRequest);
    inviteRouter.post('/', createInviteAuthorizationMiddleware, createCreateInvitationRequestHandler(inviteService));
    inviteRouter.get('/inbox', createGetReceivedInvitesRequestHandler(inviteService));
    inviteRouter.post('/:inviteUuid/accept', createInviteAcceptMiddleware(inviteService));
    inviteRouter.get('/:inviteUuid', createGetInviteRequestHandler(inviteService));
    return inviteRouter;
};
exports.default = inviteRouterFactory;
