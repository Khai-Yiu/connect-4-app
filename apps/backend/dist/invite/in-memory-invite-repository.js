var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export default class InMemoryInviteRepository {
    constructor() {
        this.invites = new Map();
    }
    create(_a) {
        return __awaiter(this, arguments, void 0, function* ({ inviter, invitee, exp, status }) {
            const uuid = crypto.randomUUID();
            this.invites.set(uuid, { uuid, inviter, invitee, exp, status });
            return {
                uuid,
                inviter,
                invitee,
                exp,
                status
            };
        });
    }
    findReceivedInvitesByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return Array.from(this.invites.values()).filter(({ inviter, invitee }) => email === invitee);
        });
    }
    findInviteById(uuid) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.invites.get(uuid);
        });
    }
}
