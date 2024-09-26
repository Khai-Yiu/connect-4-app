"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const argon2_1 = __importDefault(require("@node-rs/argon2"));
const user_service_1 = __importStar(require("@/user/user-service"));
const in_memory_user_repository_1 = __importDefault(require("@/user/in-memory-user-repository"));
describe('user-service', () => {
    describe('user creation', () => {
        describe('given the details of a user that does not exist', () => {
            it('creates the user', async () => {
                const userRepository = new in_memory_user_repository_1.default();
                const userService = new user_service_1.default(userRepository);
                const user = await userService.create({
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@gmail.com',
                    password: 'Hello123'
                });
                expect(user).toEqual(expect.objectContaining({
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@gmail.com',
                    uuid: expect.toBeUuid()
                }));
                expect(await argon2_1.default.verify(user.password, 'Hello123')).toBeTruthy();
            });
        });
        describe('given an email is already associated with an existing user', () => {
            it('throws a "user already exists" error when attempting to create users with the same email', async () => {
                const userRepository = new in_memory_user_repository_1.default();
                const userService = new user_service_1.default(userRepository);
                await userService.create({
                    firstName: 'Dung',
                    lastName: 'Eater',
                    email: 'dung.eater@gmail.com',
                    password: 'Hello123'
                });
                expect(userService.create({
                    firstName: 'Kenny',
                    lastName: 'Pho',
                    email: 'dung.eater@gmail.com',
                    password: 'Hello123'
                })).rejects.toThrow(new user_service_1.UserAlreadyExistsError('A user with that email already exists'));
            });
        });
        describe('given a user with a plain-text password', () => {
            it('creates the user with a hashed password', async () => {
                const userRepository = new in_memory_user_repository_1.default();
                const userService = new user_service_1.default(userRepository);
                const user = await userService.create({
                    firstName: 'James',
                    lastName: 'Grad',
                    email: 'james.grad@gmail.com',
                    password: 'Hello123'
                });
                expect(await argon2_1.default.verify(user.password, 'Hello123')).toBeTruthy();
            });
        });
    });
    describe('user authentication', () => {
        describe('given a registered user', () => {
            describe('and provided correct credentials', () => {
                it('authenticates the user', async () => {
                    const repository = new in_memory_user_repository_1.default();
                    const userService = new user_service_1.default(repository);
                    await userService.create({
                        firstName: 'John',
                        lastName: 'Doe',
                        email: 'john.doe@gmail.com',
                        password: 'Hello123'
                    });
                    const userCredentials = {
                        email: 'john.doe@gmail.com',
                        password: 'Hello123'
                    };
                    expect(await userService.authenticate(userCredentials)).toEqual(expect.objectContaining({ isAuthenticated: true }));
                });
            });
            describe('and provided incorrect credentials', () => {
                it('does not authenticate the user', async () => {
                    const repository = new in_memory_user_repository_1.default();
                    const userService = new user_service_1.default(repository);
                    await userService.create({
                        firstName: 'John',
                        lastName: 'Doe',
                        email: 'john.doe@gmail.com',
                        password: 'Hello123'
                    });
                    const userCredentials = {
                        email: 'john.doe@gmail.com',
                        password: 'Hello1234'
                    };
                    expect(userService.authenticate(userCredentials)).rejects.toThrow(new user_service_1.AuthenticationFailedError('Authentication failed'));
                });
            });
        });
        describe('given an unregistered user', () => {
            describe('when an authentication attempt is made', () => {
                it('throws an authentication failed error', async () => {
                    const repository = new in_memory_user_repository_1.default();
                    const userService = new user_service_1.default(repository);
                    const userCredentials = {
                        email: 'dung.eater@gmail.com',
                        password: 'DungEater123'
                    };
                    expect(userService.authenticate(userCredentials)).rejects.toThrow(new user_service_1.AuthenticationFailedError('Authentication failed'));
                });
            });
        });
    });
    describe('get user details', () => {
        describe('given the email for a user that does not exist', () => {
            it('throws an UserNotFound error', async () => {
                const repository = new in_memory_user_repository_1.default();
                const userService = new user_service_1.default(repository);
                const userEmail = 'thomas.ho@gmail.com';
                expect(userService.getUserDetails(userEmail)).rejects.toThrow(new user_service_1.UserNotFoundError('User does not exist.'));
            });
        });
        describe('given the email for a user that exists', () => {
            it('returns the user details', async () => {
                const repository = new in_memory_user_repository_1.default();
                const userService = new user_service_1.default(repository);
                const userDetails = {
                    firstName: 'Thomas',
                    lastName: 'Ho',
                    email: 'thomas.ho@gmail.com',
                    password: '1231232121321'
                };
                await userService.create(userDetails);
                expect(await userService.getUserDetails(userDetails.email)).toEqual({
                    firstName: 'Thomas',
                    lastName: 'Ho',
                    email: 'thomas.ho@gmail.com',
                    uuid: expect.toBeUuid()
                });
            });
        });
        describe('given a user uuid for an existing user', () => {
            it('returns the user details', async () => {
                const repository = new in_memory_user_repository_1.default();
                const userService = new user_service_1.default(repository);
                const userDetails = {
                    firstName: 'Thomas',
                    lastName: 'Ho',
                    email: 'thomas.ho@gmail.com',
                    password: '1231232121321'
                };
                const { uuid } = await userService.create(userDetails);
                expect(await userService.getUserDetailsByUuid(uuid)).toEqual({
                    firstName: 'Thomas',
                    lastName: 'Ho',
                    email: 'thomas.ho@gmail.com',
                    uuid,
                    password: expect.any(String)
                });
            });
        });
    });
    describe('check if user exists', () => {
        describe('given the email of an existing user', () => {
            it('returns true', async () => {
                const userRepository = new in_memory_user_repository_1.default();
                const userService = new user_service_1.default(userRepository);
                await userService.create({
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@gmail.com',
                    password: 'Hello123'
                });
                expect(await userService.getDoesUserExist('john.doe@gmail.com')).toBe(true);
            });
        });
    });
});
