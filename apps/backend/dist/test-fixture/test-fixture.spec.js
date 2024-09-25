var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import TestFixture from '@/test-fixture/test-fixture';
import { generateKeyPair } from 'jose';
import appFactory from '@/app';
describe('test-fixture', () => {
    let jwtKeyPair;
    let app;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        jwtKeyPair = yield generateKeyPair('RS256');
    }));
    beforeEach(() => {
        app = appFactory({
            stage: 'TEST',
            keySet: jwtKeyPair
        });
    });
    describe('given no parameters', () => {
        it('returns a test fixture', () => {
            const testFixture = new TestFixture();
            expect(testFixture).toBeInstanceOf(TestFixture);
        });
    });
    describe('given an App parameter is provided', () => {
        it('returns a test fixture', () => __awaiter(void 0, void 0, void 0, function* () {
            const app = appFactory({
                stage: 'TEST',
                keySet: yield generateKeyPair('RS256')
            });
            const testFixture = new TestFixture(app);
            expect(testFixture).toBeInstanceOf(TestFixture);
        }));
    });
    describe('retrieving a response', () => {
        describe('given no request', () => {
            it('returns an empty response list', () => {
                const testFixture = new TestFixture(app);
                const responses = testFixture.getResponses();
                expect(responses).toEqual([]);
            });
        });
        describe('given a single request', () => {
            it('returns a single response', () => __awaiter(void 0, void 0, void 0, function* () {
                const testFixture = new TestFixture(app);
                yield testFixture
                    .createUser('player1@gmail.com', 'Hello123')
                    .run();
                const responses = testFixture.getResponses();
                expect(responses.length).toBe(1);
                expect(responses[0].statusCode).toBe(201);
            }));
        });
        describe('given multiple requests', () => {
            it('returns a response associated for each request', () => __awaiter(void 0, void 0, void 0, function* () {
                const testFixture = new TestFixture(app);
                yield testFixture
                    .createUser('player1@gmail.com', 'Hello123')
                    .login('player1@gmail.com', 'Hello123')
                    .run();
                const responses = testFixture.getResponses();
                const createResponse = responses[0];
                const loginResponse = responses[1];
                expect(responses.length).toBe(2);
                expect(createResponse.statusCode).toBe(201);
                expect(loginResponse.statusCode).toBe(200);
            }));
            describe('and run is called multiple times', () => {
                it('should only run each request once', () => __awaiter(void 0, void 0, void 0, function* () {
                    const testFixture = new TestFixture(app);
                    yield testFixture
                        .createUser('player1@gmail.com', 'Hello123')
                        .login('player1@gmail.com', 'Hello123')
                        .run();
                    const responsesAfterFirstRun = testFixture.getResponses();
                    expect(responsesAfterFirstRun.length).toBe(2);
                    yield testFixture.run();
                    const responsesAfterSecondRun = testFixture.getResponses();
                    expect(responsesAfterSecondRun.length).toBe(2);
                }));
            });
        });
    });
    describe('chaining', () => {
        describe('given a TestFixture and a request call', () => {
            it('should return the same instance of TestFixture', () => {
                const testFixture = new TestFixture(app);
                const testFixtureCopy = testFixture.createUser('player1@gmail.com', 'Hello123');
                expect(testFixtureCopy).toBe(testFixture);
            });
        });
        describe('given multiple requests to run', () => {
            it('calls them consecutively and returns the corresponding number of responses', () => __awaiter(void 0, void 0, void 0, function* () {
                const testFixture = new TestFixture(app);
                testFixture
                    .createUser('player1@gmail.com', 'Hello123')
                    .createUser('player2@gmail.com', 'Hello123');
                const responsesBeforeRun = testFixture.getResponses();
                expect(responsesBeforeRun.length).toBe(0);
                yield testFixture.run();
                const responsesAfterRun = testFixture.getResponses();
                expect(responsesAfterRun.length).toBe(2);
            }));
        });
    });
    describe('given no requests', () => {
        describe('and run is called', () => {
            it('returns no responses', () => __awaiter(void 0, void 0, void 0, function* () {
                const testFixture = new TestFixture(app);
                yield testFixture.run();
                const responses = testFixture.getResponses();
                expect(responses.length).toBe(0);
            }));
        });
    });
    describe('given a request to signup a user', () => {
        describe('and the required email and password signup details', () => {
            describe('and optional first name and last name provided', () => {
                it('creates a user', () => __awaiter(void 0, void 0, void 0, function* () {
                    const testFixture = new TestFixture(app);
                    yield testFixture
                        .createUser('player1@gmail.com', 'Hello123', {
                        firstName: 'Player',
                        lastName: 'One'
                    })
                        .run();
                    const response = testFixture.getResponses(0);
                    expect(response.statusCode).toBe(201);
                    expect(response.body).toEqual({
                        firstName: 'Player',
                        lastName: 'One',
                        email: 'player1@gmail.com',
                        password: expect.any(String),
                        uuid: expect.toBeUuid()
                    });
                }));
            });
            describe('without any first name and last name provided', () => {
                it('creates a user with a default name', () => __awaiter(void 0, void 0, void 0, function* () {
                    const testFixture = new TestFixture(app);
                    yield testFixture
                        .createUser('player1@gmail.com', 'Hello123')
                        .run();
                    const response = testFixture.getResponses(0);
                    expect(response.statusCode).toBe(201);
                    expect(response.body).toEqual({
                        firstName: 'firstName',
                        lastName: 'lastName',
                        email: 'player1@gmail.com',
                        password: expect.any(String),
                        uuid: expect.toBeUuid()
                    });
                }));
            });
        });
    });
    describe('given a request to login', () => {
        describe('and the required login details', () => {
            it('returns a response', () => __awaiter(void 0, void 0, void 0, function* () {
                const testFixture = new TestFixture(app);
                yield testFixture
                    .createUser('player1@gmail.com', 'Hello123')
                    .login('player1@gmail.com', 'Hello123')
                    .run();
                const response = testFixture.getResponses(1);
                expect(response.statusCode).toBe(200);
            }));
        });
    });
    describe('given a request to get user details', () => {
        describe('and the required email of the user', () => {
            it('returns a response', () => __awaiter(void 0, void 0, void 0, function* () {
                const testFixture = new TestFixture(app);
                yield testFixture
                    .createUser('player1@gmail.com', 'Hello123')
                    .login('player1@gmail.com', 'Hello123')
                    .getUserDetails('player1@gmail.com')
                    .run();
                const response = testFixture.getResponses(2);
                expect(response.statusCode).toBe(200);
            }));
            describe('and an optional token', () => {
                it('returns a response', () => __awaiter(void 0, void 0, void 0, function* () {
                    const testFixture = new TestFixture(app);
                    yield testFixture
                        .createUser('player1@gmail.com', 'Hello123')
                        .login('player1@gmail.com', 'Hello123')
                        .getUserDetails('player1@gmail.com', {
                        customAuthField: 'Invalid'
                    })
                        .run();
                    const response = testFixture.getResponses(2);
                    expect(response.statusCode).toBe(401);
                    expect(response.body.errors).toEqual([
                        'You must be logged in to view your user details.'
                    ]);
                }));
            });
            describe('and an optional authenticated user', () => {
                it('returns a response', () => __awaiter(void 0, void 0, void 0, function* () {
                    const testFixture = new TestFixture(app);
                    yield testFixture
                        .createUser('player1@gmail.com', 'Hello123')
                        .login('player1@gmail.com', 'Hello123')
                        .getUserDetails('player1@gmail.com', {
                        authenticatedUser: 'player2@gmail.com'
                    })
                        .run();
                    const response = testFixture.getResponses(2);
                    expect(response.statusCode).toBe(401);
                }));
            });
        });
    });
    describe('given a request to create an invite', () => {
        describe('and the required inviter and invitee is provided', () => {
            it('returns a response', () => __awaiter(void 0, void 0, void 0, function* () {
                const testFixture = new TestFixture(app);
                yield testFixture
                    .createUser('player1@gmail.com', 'Hello123')
                    .createUser('player2@gmail.com', 'Hello123')
                    .login('player1@gmail.com', 'Hello123')
                    .createInvite('player1@gmail.com', 'player2@gmail.com')
                    .run();
                const response = testFixture.getResponses(3);
                expect(response.statusCode).toBe(201);
            }));
            describe('and an optional invalid token', () => {
                it('returns a response', () => __awaiter(void 0, void 0, void 0, function* () {
                    const testFixture = new TestFixture(app);
                    yield testFixture
                        .createUser('player1@gmail.com', 'Hello123')
                        .createUser('player2@gmail.com', 'Hello123')
                        .login('player1@gmail.com', 'Hello123')
                        .createInvite('player1@gmail.com', 'player2@gmail.com', { customAuthField: 'InvalidToken' })
                        .run();
                    const response = testFixture.getResponses(3);
                    expect(response.statusCode).toBe(401);
                }));
            });
            describe('and an optional authenticated user', () => {
                it('returns a response', () => __awaiter(void 0, void 0, void 0, function* () {
                    const testFixture = new TestFixture(app);
                    yield testFixture
                        .createUser('player1@gmail.com', 'Hello123')
                        .createUser('player2@gmail.com', 'Hello123')
                        .login('player1@gmail.com', 'Hello123')
                        .createInvite('player1@gmail.com', 'player2@gmail.com', { authenticatedUser: 'player3@gmail.com' })
                        .run();
                    const response = testFixture.getResponses(3);
                    expect(response.statusCode).toBe(401);
                }));
            });
        });
    });
    describe('given a request to retrieve all invites for a user', () => {
        describe('and the required email is provided', () => {
            it('returns a response', () => __awaiter(void 0, void 0, void 0, function* () {
                const testFixture = new TestFixture(app);
                yield testFixture
                    .createUser('player1@gmail.com', 'Hello123')
                    .createUser('player2@gmail.com', 'Hello123')
                    .login('player1@gmail.com', 'Hello123')
                    .createInvite('player1@gmail.com', 'player2@gmail.com')
                    .getReceivedInvites('player1@gmail.com')
                    .run();
                const response = testFixture.getResponses(4);
                expect(response.statusCode).toBe(201);
            }));
            describe('and an optional token', () => {
                it('returns a response', () => __awaiter(void 0, void 0, void 0, function* () {
                    const testFixture = new TestFixture(app);
                    yield testFixture
                        .createUser('player1@gmail.com', 'Hello123')
                        .createUser('player2@gmail.com', 'Hello123')
                        .login('player1@gmail.com', 'Hello123')
                        .createInvite('player1@gmail.com', 'player2@gmail.com')
                        .getReceivedInvites('player1@gmail.com', {
                        customAuthField: 'InvalidToken'
                    })
                        .run();
                    const response = testFixture.getResponses(4);
                    expect(response.statusCode).toBe(401);
                }));
            });
            describe('and an optional authenticated user', () => {
                it('returns a response', () => __awaiter(void 0, void 0, void 0, function* () {
                    const testFixture = new TestFixture(app);
                    yield testFixture
                        .createUser('player1@gmail.com', 'Hello123')
                        .createUser('player2@gmail.com', 'Hello123')
                        .login('player1@gmail.com', 'Hello123')
                        .createInvite('player1@gmail.com', 'player2@gmail.com')
                        .getReceivedInvites('player1@gmail.com', {
                        authenticatedUser: 'player2@gmail.com'
                    })
                        .run();
                    const response = testFixture.getResponses(4);
                    expect(response.statusCode).toBe(401);
                }));
            });
        });
    });
    describe('given a request to accept an invite', () => {
        describe('and the required email is provided', () => {
            it('returns a response', () => __awaiter(void 0, void 0, void 0, function* () {
                const testFixture = new TestFixture(app);
                yield testFixture
                    .createUser('player1@gmail.com', 'Hello123')
                    .createUser('player2@gmail.com', 'Hello123')
                    .login('player1@gmail.com', 'Hello123')
                    .login('player2@gmail.com', 'Hello123')
                    .createInvite('player1@gmail.com', 'player2@gmail.com')
                    .getReceivedInvites('player2@gmail.com')
                    .acceptInvite('player2@gmail.com')
                    .run();
                const response = testFixture.getResponses(5);
                expect(response.statusCode).toBe(201);
            }));
        });
    });
});
