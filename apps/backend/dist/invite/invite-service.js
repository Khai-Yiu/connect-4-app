"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidInvitationError = void 0;
const invite_service_d_1 = require("@/invite/invite-service.d");
class InvalidInvitationError extends Error {
}
exports.InvalidInvitationError = InvalidInvitationError;
class InviteService {
    userService;
    sessionService;
    inviteRepository;
    eventHandlers;
    constructor(userService, sessionService, inviteRepository, eventHandlers = {
        [invite_service_d_1.InviteEvents.INVITATION_CREATED]: () => Promise.resolve()
    }) {
        this.userService = userService;
        this.sessionService = sessionService;
        this.inviteRepository = inviteRepository;
        this.eventHandlers = eventHandlers;
    }
    async create(inviteCreationDetails) {
        if (inviteCreationDetails.invitee === inviteCreationDetails.inviter) {
            throw new InvalidInvitationError('Users can not send invites to themselves.');
        }
        const doesInviteeExist = !(await this.userService.getDoesUserExist(inviteCreationDetails.invitee));
        if (doesInviteeExist) {
            throw new InvalidInvitationError('Invitee does not exist.');
        }
        const lengthOfDayInMilliseconds = 60 * 60 * 24 * 1000;
        const inviteDetails = await this.inviteRepository.create({
            ...inviteCreationDetails,
            exp: Date.now() + lengthOfDayInMilliseconds,
            status: invite_service_d_1.InviteStatus.PENDING
        });
        await this.eventHandlers[invite_service_d_1.InviteEvents.INVITATION_CREATED](inviteDetails);
        return inviteDetails;
    }
    async getInvite(inviteUuid) {
        return await this.inviteRepository.findInviteById(inviteUuid);
    }
    async getReceivedInvites(email) {
        return (await this.inviteRepository.findReceivedInvitesByEmail(email));
    }
    async acceptInvite(uuid) {
        const inviteDetails = await this.inviteRepository.findInviteById(uuid);
        const { uuid: inviterUuid } = await this.userService.getUserDetails(inviteDetails.inviter);
        const { uuid: inviteeUuid } = await this.userService.getUserDetails(inviteDetails.invitee);
        inviteDetails.status = invite_service_d_1.InviteStatus.ACCEPTED;
        const sessionDetails = await this.sessionService.createSession({
            inviterUuid,
            inviteeUuid
        });
        return sessionDetails.uuid;
    }
}
exports.default = InviteService;
