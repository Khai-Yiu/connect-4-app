var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { isEmpty } from 'ramda';
import argon2 from 'argon2';
export class UserAlreadyExistsError extends Error {
}
export class AuthenticationFailedError extends Error {
}
export class UserNotFoundError extends Error {
}
export default class UserService {
    constructor(repository) {
        this.repository = repository;
    }
    create(userDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            if (isEmpty(yield this.repository.findByEmail(userDetails.email))) {
                return this.repository.create(Object.assign(Object.assign({}, userDetails), { password: yield argon2.hash(userDetails.password) }));
            }
            throw new UserAlreadyExistsError('A user with that email already exists');
        });
    }
    authenticate(_a) {
        return __awaiter(this, arguments, void 0, function* ({ email, password }) {
            const userDetails = (yield this.repository.findByEmail(email))[0];
            if (userDetails !== undefined) {
                const isValidPassword = yield argon2.verify(userDetails.password, password);
                if (isValidPassword) {
                    return {
                        isAuthenticated: true
                    };
                }
            }
            throw new AuthenticationFailedError('Authentication failed');
        });
    }
    getUserDetails(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const persistedUsersWithProvidedEmail = yield this.repository.findByEmail(email);
            const persistedUser = persistedUsersWithProvidedEmail[0];
            if (persistedUser === undefined) {
                throw new UserNotFoundError('User does not exist.');
            }
            return {
                uuid: persistedUser.uuid,
                firstName: persistedUser.firstName,
                lastName: persistedUser.lastName,
                email: persistedUser.email
            };
        });
    }
    getUserDetailsByUuid(uuid) {
        return __awaiter(this, void 0, void 0, function* () {
            const persistedUser = yield this.repository.findByUuid(uuid);
            return persistedUser;
        });
    }
    getDoesUserExist(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const persistedUsers = yield this.repository.findByEmail(email);
            return persistedUsers.length !== 0;
        });
    }
}
