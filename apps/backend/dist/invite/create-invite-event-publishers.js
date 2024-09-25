import { InviteEvents } from '@/invite/invite-service.d';
const createInviteEventPublishers = (eventPublisher) => {
    return {
        [InviteEvents.INVITATION_CREATED]: (inviteDetails) => eventPublisher({
            type: InviteEvents.INVITATION_CREATED,
            payload: inviteDetails
        })
    };
};
export default createInviteEventPublishers;
