var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export default class InMemoryUserRepositoryFactory {
    constructor() {
        this.users = new Map();
    }
    create(userDetails) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return Array.from(this.users.values()).filter((user) => user.email === email);
        });
    }
    findByUuid(uuid) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.users.get(uuid);
        });
    }
}
