var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import request from 'supertest';
import appFactory from '@/app';
import { generateKeyPair } from 'jose';
const createDefaultApp = () => __awaiter(void 0, void 0, void 0, function* () {
    return appFactory({
        stage: 'TEST',
        keySet: yield generateKeyPair('RS256')
    });
});
class TestFixture {
    constructor(app) {
        this.queue = [];
        this.app = app !== null && app !== void 0 ? app : (() => __awaiter(this, void 0, void 0, function* () { return yield createDefaultApp(); }));
        this.authorizationFields = {};
        this.invites = {};
        this.responses = [];
        this.queue = [];
    }
    getResponses(index) {
        return index !== undefined ? this.responses[index] : this.responses;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            while (this.queue.length > 0) {
                const task = this.queue.shift();
                yield task();
            }
            this.queue = [];
        });
    }
    addToQueue(task) {
        this.queue.push(task);
    }
    createUser(email, password, options) {
        const callbackFn = function () {
            return __awaiter(this, void 0, void 0, function* () {
                this.responses.push(yield request(this.app)
                    .post('/user/signup')
                    .send(Object.assign(Object.assign(Object.assign({}, (options === undefined
                    ? {
                        firstName: 'firstName',
                        lastName: 'lastName'
                    }
                    : options)), (email === undefined ? {} : { email })), (password === undefined ? {} : { password }))));
            });
        };
        this.addToQueue(callbackFn.bind(this));
        return this;
    }
    login(username, password) {
        const callbackFn = function () {
            return __awaiter(this, void 0, void 0, function* () {
                this.responses.push(yield request(this.app)
                    .post('/user/login')
                    .send({ username, password }));
                this.authorizationFields[username] =
                    this.responses[this.responses.length - 1].headers.authorization;
            });
        };
        this.addToQueue(callbackFn.bind(this));
        return this;
    }
    getUserDetails(email, options) {
        const callbackFn = function () {
            return __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c;
                this.responses.push(yield request(this.app)
                    .get('/user')
                    .set('Authorization', (_c = (_a = options === null || options === void 0 ? void 0 : options.customAuthField) !== null && _a !== void 0 ? _a : this.authorizationFields[(_b = options === null || options === void 0 ? void 0 : options.authenticatedUser) !== null && _b !== void 0 ? _b : email]) !== null && _c !== void 0 ? _c : 'UserNotLoggedIn')
                    .send({ email }));
            });
        };
        this.addToQueue(callbackFn.bind(this));
        return this;
    }
    createInvite(inviter, invitee, options) {
        const callbackFn = function () {
            return __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c;
                this.responses.push(yield request(this.app)
                    .post('/invite')
                    .set('Authorization', (_c = (_a = options === null || options === void 0 ? void 0 : options.customAuthField) !== null && _a !== void 0 ? _a : this.authorizationFields[(_b = options === null || options === void 0 ? void 0 : options.authenticatedUser) !== null && _b !== void 0 ? _b : inviter]) !== null && _c !== void 0 ? _c : 'UserNotLoggedIn')
                    .send({ inviter, invitee }));
            });
        };
        this.addToQueue(callbackFn.bind(this));
        return this;
    }
    getReceivedInvites(email, options) {
        const callbackFn = function () {
            return __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c;
                this.responses.push(yield request(this.app)
                    .get('/invite/inbox')
                    .set('Authorization', (_c = (_a = options === null || options === void 0 ? void 0 : options.customAuthField) !== null && _a !== void 0 ? _a : this.authorizationFields[(_b = options === null || options === void 0 ? void 0 : options.authenticatedUser) !== null && _b !== void 0 ? _b : email]) !== null && _c !== void 0 ? _c : 'UserNotLoggedIn')
                    .send());
                const newInvites = this.responses[this.responses.length - 1].body.invites;
                this.invites[email] =
                    this.invites[email] === undefined
                        ? newInvites
                        : [...this.invites[email], ...newInvites];
            });
        };
        this.addToQueue(callbackFn.bind(this));
        return this;
    }
    acceptInvite(email, inviteIndex = 0, options) {
        const callbackFn = function () {
            return __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c;
                const { uuid } = this.invites[email][inviteIndex];
                this.responses.push(yield request(this.app)
                    .post(`/invite/${uuid}/accept`)
                    .set('Authorization', (_c = (_a = options === null || options === void 0 ? void 0 : options.customAuthField) !== null && _a !== void 0 ? _a : this.authorizationFields[(_b = options === null || options === void 0 ? void 0 : options.authenticatedUser) !== null && _b !== void 0 ? _b : email]) !== null && _c !== void 0 ? _c : 'UserNotLoggedIn')
                    .send());
            });
        };
        this.addToQueue(callbackFn.bind(this));
        return this;
    }
}
export default TestFixture;
