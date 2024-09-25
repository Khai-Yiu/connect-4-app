import { InviteEvents } from '@/invite/invite-service.d';
const createInviteEventListener = (subscription, notificationFn) => {
    subscription.subscribe({
        next: (inviteEvent) => {
            const { type, payload } = inviteEvent;
            if (type === InviteEvents.INVITATION_CREATED) {
                notificationFn({
                    recipient: payload.invitee,
                    type: 'invite_received',
                    payload
                });
            }
        }
    });
};
export default createInviteEventListener;
