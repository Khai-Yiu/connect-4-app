"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const invite_service_d_1 = require("@/invite/invite-service.d");
const createInviteEventPublishers = (eventPublisher) => {
    return {
        [invite_service_d_1.InviteEvents.INVITATION_CREATED]: (inviteDetails) => eventPublisher({
            type: invite_service_d_1.InviteEvents.INVITATION_CREATED,
            payload: inviteDetails
        })
    };
};
exports.default = createInviteEventPublishers;
