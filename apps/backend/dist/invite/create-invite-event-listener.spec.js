"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const invite_service_d_1 = require("@/invite/invite-service.d");
const rxjs_1 = require("rxjs");
const create_invite_event_listener_1 = __importDefault(require("@/invite/create-invite-event-listener"));
describe('create-invite-event-consumer', () => {
    describe('given an event subscription', () => {
        describe('and an invitee notification function', () => {
            describe('and an invite is sent', () => { });
            const subscriptionFn = new rxjs_1.Subject();
            const notificationFn = jest.fn();
            (0, create_invite_event_listener_1.default)(subscriptionFn, notificationFn);
            describe('when an "invite_created" event is received', () => {
                it('notifies the invitee', () => {
                    subscriptionFn.next({
                        type: invite_service_d_1.InviteEvents.INVITATION_CREATED,
                        payload: {
                            inviter: 'inviter@gmail.com',
                            invitee: 'some@gmail.com',
                            exp: Date.now(),
                            uuid: crypto.randomUUID(),
                            status: invite_service_d_1.InviteStatus.PENDING
                        }
                    });
                    expect(notificationFn).toHaveBeenCalledWith({
                        recipient: 'some@gmail.com',
                        type: 'invite_received',
                        payload: {
                            inviter: 'inviter@gmail.com',
                            invitee: 'some@gmail.com',
                            exp: expect.any(Number),
                            uuid: expect.toBeUuid(),
                            status: invite_service_d_1.InviteStatus.PENDING
                        }
                    });
                });
            });
        });
    });
});
