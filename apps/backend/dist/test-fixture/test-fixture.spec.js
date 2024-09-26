"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_fixture_1 = __importDefault(require("@/test-fixture/test-fixture"));
const jose_1 = require("jose");
const app_1 = __importDefault(require("@/app"));
describe('test-fixture', () => {
    let jwtKeyPair;
    let app;
    beforeAll(async () => {
        jwtKeyPair = await (0, jose_1.generateKeyPair)('RS256');
    });
    beforeEach(() => {
        app = (0, app_1.default)({
            stage: 'TEST',
            keySet: jwtKeyPair
        });
    });
    describe('given no parameters', () => {
        it('returns a test fixture', () => {
            const testFixture = new test_fixture_1.default();
            expect(testFixture).toBeInstanceOf(test_fixture_1.default);
        });
    });
    describe('given an App parameter is provided', () => {
        it('returns a test fixture', async () => {
            const app = (0, app_1.default)({
                stage: 'TEST',
                keySet: await (0, jose_1.generateKeyPair)('RS256')
            });
            const testFixture = new test_fixture_1.default(app);
            expect(testFixture).toBeInstanceOf(test_fixture_1.default);
        });
    });
    describe('retrieving a response', () => {
        describe('given no request', () => {
            it('returns an empty response list', () => {
                const testFixture = new test_fixture_1.default(app);
                const responses = testFixture.getResponses();
                expect(responses).toEqual([]);
            });
        });
        describe('given a single request', () => {
            it('returns a single response', async () => {
                const testFixture = new test_fixture_1.default(app);
                await testFixture
                    .createUser('player1@gmail.com', 'Hello123')
                    .run();
                const responses = testFixture.getResponses();
                expect(responses.length).toBe(1);
                expect(responses[0].statusCode).toBe(201);
            });
        });
        describe('given multiple requests', () => {
            it('returns a response associated for each request', async () => {
                const testFixture = new test_fixture_1.default(app);
                await testFixture
                    .createUser('player1@gmail.com', 'Hello123')
                    .login('player1@gmail.com', 'Hello123')
                    .run();
                const responses = testFixture.getResponses();
                const createResponse = responses[0];
                const loginResponse = responses[1];
                expect(responses.length).toBe(2);
                expect(createResponse.statusCode).toBe(201);
                expect(loginResponse.statusCode).toBe(200);
            });
            describe('and run is called multiple times', () => {
                it('should only run each request once', async () => {
                    const testFixture = new test_fixture_1.default(app);
                    await testFixture
                        .createUser('player1@gmail.com', 'Hello123')
                        .login('player1@gmail.com', 'Hello123')
                        .run();
                    const responsesAfterFirstRun = testFixture.getResponses();
                    expect(responsesAfterFirstRun.length).toBe(2);
                    await testFixture.run();
                    const responsesAfterSecondRun = testFixture.getResponses();
                    expect(responsesAfterSecondRun.length).toBe(2);
                });
            });
        });
    });
    describe('chaining', () => {
        describe('given a TestFixture and a request call', () => {
            it('should return the same instance of TestFixture', () => {
                const testFixture = new test_fixture_1.default(app);
                const testFixtureCopy = testFixture.createUser('player1@gmail.com', 'Hello123');
                expect(testFixtureCopy).toBe(testFixture);
            });
        });
        describe('given multiple requests to run', () => {
            it('calls them consecutively and returns the corresponding number of responses', async () => {
                const testFixture = new test_fixture_1.default(app);
                testFixture
                    .createUser('player1@gmail.com', 'Hello123')
                    .createUser('player2@gmail.com', 'Hello123');
                const responsesBeforeRun = testFixture.getResponses();
                expect(responsesBeforeRun.length).toBe(0);
                await testFixture.run();
                const responsesAfterRun = testFixture.getResponses();
                expect(responsesAfterRun.length).toBe(2);
            });
        });
    });
    describe('given no requests', () => {
        describe('and run is called', () => {
            it('returns no responses', async () => {
                const testFixture = new test_fixture_1.default(app);
                await testFixture.run();
                const responses = testFixture.getResponses();
                expect(responses.length).toBe(0);
            });
        });
    });
    describe('given a request to signup a user', () => {
        describe('and the required email and password signup details', () => {
            describe('and optional first name and last name provided', () => {
                it('creates a user', async () => {
                    const testFixture = new test_fixture_1.default(app);
                    await testFixture
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
                });
            });
            describe('without any first name and last name provided', () => {
                it('creates a user with a default name', async () => {
                    const testFixture = new test_fixture_1.default(app);
                    await testFixture
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
                });
            });
        });
    });
    describe('given a request to login', () => {
        describe('and the required login details', () => {
            it('returns a response', async () => {
                const testFixture = new test_fixture_1.default(app);
                await testFixture
                    .createUser('player1@gmail.com', 'Hello123')
                    .login('player1@gmail.com', 'Hello123')
                    .run();
                const response = testFixture.getResponses(1);
                expect(response.statusCode).toBe(200);
            });
        });
    });
    describe('given a request to get user details', () => {
        describe('and the required email of the user', () => {
            it('returns a response', async () => {
                const testFixture = new test_fixture_1.default(app);
                await testFixture
                    .createUser('player1@gmail.com', 'Hello123')
                    .login('player1@gmail.com', 'Hello123')
                    .getUserDetails('player1@gmail.com')
                    .run();
                const response = testFixture.getResponses(2);
                expect(response.statusCode).toBe(200);
            });
            describe('and an optional token', () => {
                it('returns a response', async () => {
                    const testFixture = new test_fixture_1.default(app);
                    await testFixture
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
                });
            });
            describe('and an optional authenticated user', () => {
                it('returns a response', async () => {
                    const testFixture = new test_fixture_1.default(app);
                    await testFixture
                        .createUser('player1@gmail.com', 'Hello123')
                        .login('player1@gmail.com', 'Hello123')
                        .getUserDetails('player1@gmail.com', {
                        authenticatedUser: 'player2@gmail.com'
                    })
                        .run();
                    const response = testFixture.getResponses(2);
                    expect(response.statusCode).toBe(401);
                });
            });
        });
    });
    describe('given a request to create an invite', () => {
        describe('and the required inviter and invitee is provided', () => {
            it('returns a response', async () => {
                const testFixture = new test_fixture_1.default(app);
                await testFixture
                    .createUser('player1@gmail.com', 'Hello123')
                    .createUser('player2@gmail.com', 'Hello123')
                    .login('player1@gmail.com', 'Hello123')
                    .createInvite('player1@gmail.com', 'player2@gmail.com')
                    .run();
                const response = testFixture.getResponses(3);
                expect(response.statusCode).toBe(201);
            });
            describe('and an optional invalid token', () => {
                it('returns a response', async () => {
                    const testFixture = new test_fixture_1.default(app);
                    await testFixture
                        .createUser('player1@gmail.com', 'Hello123')
                        .createUser('player2@gmail.com', 'Hello123')
                        .login('player1@gmail.com', 'Hello123')
                        .createInvite('player1@gmail.com', 'player2@gmail.com', { customAuthField: 'InvalidToken' })
                        .run();
                    const response = testFixture.getResponses(3);
                    expect(response.statusCode).toBe(401);
                });
            });
            describe('and an optional authenticated user', () => {
                it('returns a response', async () => {
                    const testFixture = new test_fixture_1.default(app);
                    await testFixture
                        .createUser('player1@gmail.com', 'Hello123')
                        .createUser('player2@gmail.com', 'Hello123')
                        .login('player1@gmail.com', 'Hello123')
                        .createInvite('player1@gmail.com', 'player2@gmail.com', { authenticatedUser: 'player3@gmail.com' })
                        .run();
                    const response = testFixture.getResponses(3);
                    expect(response.statusCode).toBe(401);
                });
            });
        });
    });
    describe('given a request to retrieve all invites for a user', () => {
        describe('and the required email is provided', () => {
            it('returns a response', async () => {
                const testFixture = new test_fixture_1.default(app);
                await testFixture
                    .createUser('player1@gmail.com', 'Hello123')
                    .createUser('player2@gmail.com', 'Hello123')
                    .login('player1@gmail.com', 'Hello123')
                    .createInvite('player1@gmail.com', 'player2@gmail.com')
                    .getReceivedInvites('player1@gmail.com')
                    .run();
                const response = testFixture.getResponses(4);
                expect(response.statusCode).toBe(201);
            });
            describe('and an optional token', () => {
                it('returns a response', async () => {
                    const testFixture = new test_fixture_1.default(app);
                    await testFixture
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
                });
            });
            describe('and an optional authenticated user', () => {
                it('returns a response', async () => {
                    const testFixture = new test_fixture_1.default(app);
                    await testFixture
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
                });
            });
        });
    });
    describe('given a request to accept an invite', () => {
        describe('and the required email is provided', () => {
            it('returns a response', async () => {
                const testFixture = new test_fixture_1.default(app);
                await testFixture
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
            });
        });
    });
});
