"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class InMemoryUserRepositoryFactory {
    users;
    constructor() {
        this.users = new Map();
    }
    async create(userDetails) {
        const { firstName, lastName, email, password } = userDetails;
        const uuid = crypto.randomUUID();
        this.users.set(uuid, { firstName, lastName, email, password, uuid });
        return {
            firstName,
            lastName,
            email,
            password,
            uuid
        };
    }
    async findByEmail(email) {
        return Array.from(this.users.values()).filter((user) => user.email === email);
    }
    async findByUuid(uuid) {
        return this.users.get(uuid);
    }
}
exports.default = InMemoryUserRepositoryFactory;
