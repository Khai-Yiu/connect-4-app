"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class InMemoryInviteRepository {
    invites;
    constructor() {
        this.invites = new Map();
    }
    async create({ inviter, invitee, exp, status }) {
        const uuid = crypto.randomUUID();
        this.invites.set(uuid, { uuid, inviter, invitee, exp, status });
        return {
            uuid,
            inviter,
            invitee,
            exp,
            status
        };
    }
    async findReceivedInvitesByEmail(email) {
        return Array.from(this.invites.values()).filter(({ inviter, invitee }) => email === invitee);
    }
    async findInviteById(uuid) {
        return this.invites.get(uuid);
    }
}
exports.default = InMemoryInviteRepository;
