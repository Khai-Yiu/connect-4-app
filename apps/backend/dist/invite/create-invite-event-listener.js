"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const invite_service_d_1 = require("@/invite/invite-service.d");
const createInviteEventListener = (subscription, notificationFn) => {
    subscription.subscribe({
        next: (inviteEvent) => {
            const { type, payload } = inviteEvent;
            if (type === invite_service_d_1.InviteEvents.INVITATION_CREATED) {
                notificationFn({
                    recipient: payload.invitee,
                    type: 'invite_received',
                    payload
                });
            }
        }
    });
};
exports.default = createInviteEventListener;
