"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("@/app"));
const jose_1 = require("jose");
const ramda_1 = require("ramda");
const test_fixture_1 = __importDefault(require("@/test-fixture/test-fixture"));
describe('user-integration', () => {
    let app;
    let port;
    let jwtKeyPair;
    let testFixture;
    let currentDateInMilliseconds;
    beforeAll(async () => {
        jwtKeyPair = await (0, jose_1.generateKeyPair)('RS256');
    });
    beforeEach(() => {
        jest.useFakeTimers({
            doNotFake: ['setImmediate']
        });
        currentDateInMilliseconds = Date.now();
        jest.setSystemTime(currentDateInMilliseconds);
        app = (0, app_1.default)({
            stage: 'TEST',
            keySet: jwtKeyPair
        });
        port = app.port;
        testFixture = new test_fixture_1.default(app);
    });
    afterEach(() => {
        jest.useRealTimers();
    });
    describe('signup', () => {
        describe('given the user does not exist', () => {
            it('creates a user', async () => {
                await testFixture
                    .createUser('john.doe@gmail.com', 'Hello123', {
                    firstName: 'John',
                    lastName: 'Doe'
                })
                    .run();
                const response = testFixture.getResponses(0);
                expect(response.statusCode).toBe(201);
                expect(response.body).toEqual(expect.objectContaining({
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@gmail.com',
                    uuid: expect.toBeUuid()
                }));
                expect(response.headers['content-type']).toMatch(/json/);
            });
        });
        describe('given a user already exists with a given email', () => {
            it('forbids creation of another user with that email', async () => {
                await testFixture
                    .createUser('pho.devourer@gmail.com', 'Hello123')
                    .createUser('pho.devourer@gmail.com', 'Hello123')
                    .run();
                const response = testFixture.getResponses(1);
                expect(response.statusCode).toBe(403);
                expect(response.body.errors).toEqual([
                    'A user with that email already exists'
                ]);
                expect(response.headers['content-type']).toMatch(/json/);
            });
        });
        describe('given invalid user details', () => {
            it('forbids creation of user', async () => {
                await testFixture
                    .createUser('dempsey.lamington@gmail.com', undefined, {
                    firstName: 'Dempsey',
                    lastName: undefined
                })
                    .run();
                const response = testFixture.getResponses(0);
                expect(response.statusCode).toBe(403);
                expect(response.body.errors).toEqual([
                    {
                        message: '"lastName" is required',
                        path: 'lastName'
                    },
                    {
                        message: '"password" is required',
                        path: 'password'
                    }
                ]);
                expect(response.headers['content-type']).toMatch(/json/);
            });
        });
    });
    describe('login', () => {
        describe('given a user already exists', () => {
            describe('and they provide the correct credentials', () => {
                it('they are provided with a session token', async () => {
                    await testFixture
                        .createUser('dung.eater@gmail.com', 'IAmTheDungEater')
                        .login('dung.eater@gmail.com', 'IAmTheDungEater')
                        .run();
                    const loginResponse = testFixture.getResponses(1);
                    const jwt = (0, ramda_1.pipe)((0, ramda_1.path)(['headers', 'authorization']), (0, ramda_1.split)(' '), ramda_1.last)(loginResponse);
                    const { payload, protectedHeader } = await (0, jose_1.jwtDecrypt)(jwt, jwtKeyPair.privateKey);
                    const durationOfADayInSeconds = 1 * 24 * 60 * 60;
                    const dateInSeconds = Math.trunc(currentDateInMilliseconds / 1000);
                    expect(protectedHeader).toEqual({
                        alg: 'RSA-OAEP-256',
                        typ: 'JWT',
                        enc: 'A256GCM'
                    });
                    expect(payload).toEqual({
                        iss: 'connect4-http-server',
                        iat: dateInSeconds,
                        exp: dateInSeconds + durationOfADayInSeconds,
                        sub: 'dung.eater@gmail.com',
                        nbf: dateInSeconds,
                        username: 'dung.eater@gmail.com',
                        roles: []
                    });
                });
                it('receives the relative path to the notifications endpoint', async () => {
                    await testFixture
                        .createUser('player1@gmail.com', 'Hello123')
                        .login('player1@gmail.com', 'Hello123')
                        .run();
                    const response = testFixture.getResponses(1);
                    expect(response.body.links).toEqual({
                        notifications: `ws://localhost:${port}/notification`
                    });
                });
            });
            describe('and they provide incorrect credentials', () => {
                it('responds with http status code 403', async () => {
                    await testFixture
                        .createUser('dung.eater@gmail.com', 'IAmTheDungEater')
                        .login('dung.eater@gmail.com', 'IAmTheDungEater1')
                        .run();
                    const response = testFixture.getResponses(1);
                    expect(response.statusCode).toBe(403);
                    expect(response.body.errors).toEqual([
                        'Login attempt failed.'
                    ]);
                    expect(response.headers['content-type']).toMatch(/json/);
                });
            });
        });
        describe('given credentials for a user that does not exist', () => {
            it('responds with a http status code 403', async () => {
                await testFixture
                    .login('dung.eater@gmail.com', 'Hello123')
                    .run();
                const response = testFixture.getResponses(0);
                expect(response.statusCode).toBe(403);
                expect(response.body.errors).toEqual(['Login attempt failed.']);
                expect(response.headers['content-type']).toMatch(/json/);
            });
        });
    });
    describe('user', () => {
        describe('given the user does not provide an authorization token', () => {
            describe('when they attempt to view their user details', () => {
                it('responds with http status code 401', async () => {
                    await testFixture
                        .createUser('dung.eater@gmail.com', 'IAmTheDungEater')
                        .getUserDetails('dung.eater@gmail.com')
                        .run();
                    const response = testFixture.getResponses(1);
                    expect(response.statusCode).toBe(401);
                    expect(response.body.errors).toEqual([
                        'You must be logged in to view your user details.'
                    ]);
                });
            });
        });
        describe('given a user provides an authorization token', () => {
            describe('and their token is invalid', () => {
                it('responds with http status code 401', async () => {
                    await testFixture
                        .createUser('dung.eater@gmail.com', 'IAmTheDungEater')
                        .getUserDetails('dung.eater@gmail.com', {
                        customAuthField: 'InvalidToken'
                    })
                        .run();
                    const response = testFixture.getResponses(1);
                    expect(response.statusCode).toBe(401);
                    expect(response.body.errors).toEqual([
                        'You must be logged in to view your user details.'
                    ]);
                });
            });
            describe('and their token is expired', () => {
                it('responds with http status code 401', async () => {
                    await testFixture
                        .createUser('dung.eater@gmail.com', 'IAmTheDungEater')
                        .login('dung.eater@gmail.com', 'IAmTheDungEater')
                        .run();
                    const loginResponse = testFixture.getResponses(1);
                    const dateOfFollowingDayInMilliseconds = Date.now() + 60 * 60 * 24 * 1000;
                    jest.setSystemTime(dateOfFollowingDayInMilliseconds);
                    await testFixture
                        .getUserDetails('dung.eater@gmail.com', {
                        customAuthField: loginResponse.headers.authorization
                    })
                        .run();
                    const response = testFixture.getResponses(2);
                    expect(response.statusCode).toBe(401);
                    expect(response.body.errors).toEqual([
                        'You must be logged in to view your user details.'
                    ]);
                    jest.useRealTimers();
                });
            });
            describe('and their token is valid', () => {
                it('responds with the user details', async () => {
                    await testFixture
                        .createUser('dung.eater@gmail.com', 'IAmTheDungEater', {
                        firstName: 'Dung',
                        lastName: 'Eater'
                    })
                        .login('dung.eater@gmail.com', 'IAmTheDungEater')
                        .getUserDetails('dung.eater@gmail.com')
                        .run();
                    const response = testFixture.getResponses(2);
                    expect(response.statusCode).toBe(200);
                    expect(response.body).toEqual({
                        firstName: 'Dung',
                        lastName: 'Eater',
                        email: 'dung.eater@gmail.com',
                        uuid: expect.toBeUuid()
                    });
                });
            });
        });
    });
});
