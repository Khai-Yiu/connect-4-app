"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("@/app"));
const jose_1 = require("jose");
const createDefaultApp = async () => {
    return (0, app_1.default)({
        stage: 'TEST',
        keySet: await (0, jose_1.generateKeyPair)('RS256')
    });
};
class TestFixture {
    app;
    authorizationFields;
    invites;
    responses;
    queue = [];
    constructor(app) {
        this.app = app ?? (async () => await createDefaultApp());
        this.authorizationFields = {};
        this.invites = {};
        this.responses = [];
        this.queue = [];
    }
    getResponses(index) {
        return index !== undefined ? this.responses[index] : this.responses;
    }
    async run() {
        while (this.queue.length > 0) {
            const task = this.queue.shift();
            await task();
        }
        this.queue = [];
    }
    addToQueue(task) {
        this.queue.push(task);
    }
    createUser(email, password, options) {
        const callbackFn = async function () {
            this.responses.push(await (0, supertest_1.default)(this.app)
                .post('/user/signup')
                .send({
                ...(options === undefined
                    ? {
                        firstName: 'firstName',
                        lastName: 'lastName'
                    }
                    : options),
                ...(email === undefined ? {} : { email }),
                ...(password === undefined ? {} : { password })
            }));
        };
        this.addToQueue(callbackFn.bind(this));
        return this;
    }
    login(username, password) {
        const callbackFn = async function () {
            this.responses.push(await (0, supertest_1.default)(this.app)
                .post('/user/login')
                .send({ username, password }));
            this.authorizationFields[username] =
                this.responses[this.responses.length - 1].headers.authorization;
        };
        this.addToQueue(callbackFn.bind(this));
        return this;
    }
    getUserDetails(email, options) {
        const callbackFn = async function () {
            this.responses.push(await (0, supertest_1.default)(this.app)
                .get('/user')
                .set('Authorization', options?.customAuthField ??
                this.authorizationFields[options?.authenticatedUser ?? email] ??
                'UserNotLoggedIn')
                .send({ email }));
        };
        this.addToQueue(callbackFn.bind(this));
        return this;
    }
    createInvite(inviter, invitee, options) {
        const callbackFn = async function () {
            this.responses.push(await (0, supertest_1.default)(this.app)
                .post('/invite')
                .set('Authorization', options?.customAuthField ??
                this.authorizationFields[options?.authenticatedUser ?? inviter] ??
                'UserNotLoggedIn')
                .send({ inviter, invitee }));
        };
        this.addToQueue(callbackFn.bind(this));
        return this;
    }
    getReceivedInvites(email, options) {
        const callbackFn = async function () {
            this.responses.push(await (0, supertest_1.default)(this.app)
                .get('/invite/inbox')
                .set('Authorization', options?.customAuthField ??
                this.authorizationFields[options?.authenticatedUser ?? email] ??
                'UserNotLoggedIn')
                .send());
            const newInvites = this.responses[this.responses.length - 1].body.invites;
            this.invites[email] =
                this.invites[email] === undefined
                    ? newInvites
                    : [...this.invites[email], ...newInvites];
        };
        this.addToQueue(callbackFn.bind(this));
        return this;
    }
    acceptInvite(email, inviteIndex = 0, options) {
        const callbackFn = async function () {
            const { uuid } = this.invites[email][inviteIndex];
            this.responses.push(await (0, supertest_1.default)(this.app)
                .post(`/invite/${uuid}/accept`)
                .set('Authorization', options?.customAuthField ??
                this.authorizationFields[options?.authenticatedUser ?? email] ??
                'UserNotLoggedIn')
                .send());
        };
        this.addToQueue(callbackFn.bind(this));
        return this;
    }
}
exports.default = TestFixture;
