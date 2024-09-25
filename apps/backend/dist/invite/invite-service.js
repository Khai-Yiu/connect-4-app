var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { InviteEvents, InviteStatus } from '@/invite/invite-service.d';
export class InvalidInvitationError extends Error {
}
export default class InviteService {
    constructor(userService, sessionService, inviteRepository, eventHandlers = {
        [InviteEvents.INVITATION_CREATED]: () => Promise.resolve()
    }) {
        this.userService = userService;
        this.sessionService = sessionService;
        this.inviteRepository = inviteRepository;
        this.eventHandlers = eventHandlers;
    }
    create(inviteCreationDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            if (inviteCreationDetails.invitee === inviteCreationDetails.inviter) {
                throw new InvalidInvitationError('Users can not send invites to themselves.');
            }
            const doesInviteeExist = !(yield this.userService.getDoesUserExist(inviteCreationDetails.invitee));
            if (doesInviteeExist) {
                throw new InvalidInvitationError('Invitee does not exist.');
            }
            const lengthOfDayInMilliseconds = 60 * 60 * 24 * 1000;
            const inviteDetails = yield this.inviteRepository.create(Object.assign(Object.assign({}, inviteCreationDetails), { exp: Date.now() + lengthOfDayInMilliseconds, status: InviteStatus.PENDING }));
            yield this.eventHandlers[InviteEvents.INVITATION_CREATED](inviteDetails);
            return inviteDetails;
        });
    }
    getInvite(inviteUuid) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.inviteRepository.findInviteById(inviteUuid);
        });
    }
    getReceivedInvites(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.inviteRepository.findReceivedInvitesByEmail(email));
        });
    }
    acceptInvite(uuid) {
        return __awaiter(this, void 0, void 0, function* () {
            const inviteDetails = yield this.inviteRepository.findInviteById(uuid);
            const { uuid: inviterUuid } = yield this.userService.getUserDetails(inviteDetails.inviter);
            const { uuid: inviteeUuid } = yield this.userService.getUserDetails(inviteDetails.invitee);
            inviteDetails.status = InviteStatus.ACCEPTED;
            const sessionDetails = yield this.sessionService.createSession({
                inviterUuid,
                inviteeUuid
            });
            return sessionDetails.uuid;
        });
    }
}
