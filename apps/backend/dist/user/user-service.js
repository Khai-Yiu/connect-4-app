"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserNotFoundError = exports.AuthenticationFailedError = exports.UserAlreadyExistsError = void 0;
const ramda_1 = require("ramda");
const argon2_1 = __importDefault(require("@node-rs/argon2"));
class UserAlreadyExistsError extends Error {
}
exports.UserAlreadyExistsError = UserAlreadyExistsError;
class AuthenticationFailedError extends Error {
}
exports.AuthenticationFailedError = AuthenticationFailedError;
class UserNotFoundError extends Error {
}
exports.UserNotFoundError = UserNotFoundError;
class UserService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async create(userDetails) {
        if ((0, ramda_1.isEmpty)(await this.repository.findByEmail(userDetails.email))) {
            return this.repository.create({
                ...userDetails,
                password: await argon2_1.default.hash(userDetails.password)
            });
        }
        throw new UserAlreadyExistsError('A user with that email already exists');
    }
    async authenticate({ email, password }) {
        const userDetails = (await this.repository.findByEmail(email))[0];
        if (userDetails !== undefined) {
            const isValidPassword = await argon2_1.default.verify(userDetails.password, password);
            if (isValidPassword) {
                return {
                    isAuthenticated: true
                };
            }
        }
        throw new AuthenticationFailedError('Authentication failed');
    }
    async getUserDetails(email) {
        const persistedUsersWithProvidedEmail = await this.repository.findByEmail(email);
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
    }
    async getUserDetailsByUuid(uuid) {
        const persistedUser = await this.repository.findByUuid(uuid);
        return persistedUser;
    }
    async getDoesUserExist(email) {
        const persistedUsers = await this.repository.findByEmail(email);
        return persistedUsers.length !== 0;
    }
}
exports.default = UserService;
