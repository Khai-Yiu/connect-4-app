var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import argon2 from 'argon2';
import UserService, { AuthenticationFailedError, UserAlreadyExistsError, UserNotFoundError } from '@/user/user-service';
import InMemoryUserRepositoryFactory from '@/user/in-memory-user-repository';
describe('user-service', () => {
    describe('user creation', () => {
        describe('given the details of a user that does not exist', () => {
            it('creates the user', () => __awaiter(void 0, void 0, void 0, function* () {
                const userRepository = new InMemoryUserRepositoryFactory();
                const userService = new UserService(userRepository);
                const user = yield userService.create({
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
                expect(yield argon2.verify(user.password, 'Hello123')).toBeTruthy();
            }));
        });
        describe('given an email is already associated with an existing user', () => {
            it('throws a "user already exists" error when attempting to create users with the same email', () => __awaiter(void 0, void 0, void 0, function* () {
                const userRepository = new InMemoryUserRepositoryFactory();
                const userService = new UserService(userRepository);
                yield userService.create({
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
                })).rejects.toThrow(new UserAlreadyExistsError('A user with that email already exists'));
            }));
        });
        describe('given a user with a plain-text password', () => {
            it('creates the user with a hashed password', () => __awaiter(void 0, void 0, void 0, function* () {
                const userRepository = new InMemoryUserRepositoryFactory();
                const userService = new UserService(userRepository);
                const user = yield userService.create({
                    firstName: 'James',
                    lastName: 'Grad',
                    email: 'james.grad@gmail.com',
                    password: 'Hello123'
                });
                expect(yield argon2.verify(user.password, 'Hello123')).toBeTruthy();
            }));
        });
    });
    describe('user authentication', () => {
        describe('given a registered user', () => {
            describe('and provided correct credentials', () => {
                it('authenticates the user', () => __awaiter(void 0, void 0, void 0, function* () {
                    const repository = new InMemoryUserRepositoryFactory();
                    const userService = new UserService(repository);
                    yield userService.create({
                        firstName: 'John',
                        lastName: 'Doe',
                        email: 'john.doe@gmail.com',
                        password: 'Hello123'
                    });
                    const userCredentials = {
                        email: 'john.doe@gmail.com',
                        password: 'Hello123'
                    };
                    expect(yield userService.authenticate(userCredentials)).toEqual(expect.objectContaining({ isAuthenticated: true }));
                }));
            });
            describe('and provided incorrect credentials', () => {
                it('does not authenticate the user', () => __awaiter(void 0, void 0, void 0, function* () {
                    const repository = new InMemoryUserRepositoryFactory();
                    const userService = new UserService(repository);
                    yield userService.create({
                        firstName: 'John',
                        lastName: 'Doe',
                        email: 'john.doe@gmail.com',
                        password: 'Hello123'
                    });
                    const userCredentials = {
                        email: 'john.doe@gmail.com',
                        password: 'Hello1234'
                    };
                    expect(userService.authenticate(userCredentials)).rejects.toThrow(new AuthenticationFailedError('Authentication failed'));
                }));
            });
        });
        describe('given an unregistered user', () => {
            describe('when an authentication attempt is made', () => {
                it('throws an authentication failed error', () => __awaiter(void 0, void 0, void 0, function* () {
                    const repository = new InMemoryUserRepositoryFactory();
                    const userService = new UserService(repository);
                    const userCredentials = {
                        email: 'dung.eater@gmail.com',
                        password: 'DungEater123'
                    };
                    expect(userService.authenticate(userCredentials)).rejects.toThrow(new AuthenticationFailedError('Authentication failed'));
                }));
            });
        });
    });
    describe('get user details', () => {
        describe('given the email for a user that does not exist', () => {
            it('throws an UserNotFound error', () => __awaiter(void 0, void 0, void 0, function* () {
                const repository = new InMemoryUserRepositoryFactory();
                const userService = new UserService(repository);
                const userEmail = 'thomas.ho@gmail.com';
                expect(userService.getUserDetails(userEmail)).rejects.toThrow(new UserNotFoundError('User does not exist.'));
            }));
        });
        describe('given the email for a user that exists', () => {
            it('returns the user details', () => __awaiter(void 0, void 0, void 0, function* () {
                const repository = new InMemoryUserRepositoryFactory();
                const userService = new UserService(repository);
                const userDetails = {
                    firstName: 'Thomas',
                    lastName: 'Ho',
                    email: 'thomas.ho@gmail.com',
                    password: '1231232121321'
                };
                yield userService.create(userDetails);
                expect(yield userService.getUserDetails(userDetails.email)).toEqual({
                    firstName: 'Thomas',
                    lastName: 'Ho',
                    email: 'thomas.ho@gmail.com',
                    uuid: expect.toBeUuid()
                });
            }));
        });
        describe('given a user uuid for an existing user', () => {
            it('returns the user details', () => __awaiter(void 0, void 0, void 0, function* () {
                const repository = new InMemoryUserRepositoryFactory();
                const userService = new UserService(repository);
                const userDetails = {
                    firstName: 'Thomas',
                    lastName: 'Ho',
                    email: 'thomas.ho@gmail.com',
                    password: '1231232121321'
                };
                const { uuid } = yield userService.create(userDetails);
                expect(yield userService.getUserDetailsByUuid(uuid)).toEqual({
                    firstName: 'Thomas',
                    lastName: 'Ho',
                    email: 'thomas.ho@gmail.com',
                    uuid,
                    password: expect.any(String)
                });
            }));
        });
    });
    describe('check if user exists', () => {
        describe('given the email of an existing user', () => {
            it('returns true', () => __awaiter(void 0, void 0, void 0, function* () {
                const userRepository = new InMemoryUserRepositoryFactory();
                const userService = new UserService(userRepository);
                yield userService.create({
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@gmail.com',
                    password: 'Hello123'
                });
                expect(yield userService.getDoesUserExist('john.doe@gmail.com')).toBe(true);
            }));
        });
    });
});
