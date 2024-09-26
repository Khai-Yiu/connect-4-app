"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const create_invite_event_publishers_1 = __importDefault(require("@/invite/create-invite-event-publishers"));
const invite_service_d_1 = require("@/invite/invite-service.d");
describe('create-invite-event-publishers', () => {
    describe('given an event publisher', () => {
        it('creates an event handler', () => {
            const mockEventPublisher = jest.fn();
            const eventHandlers = (0, create_invite_event_publishers_1.default)(mockEventPublisher);
            expect(eventHandlers).toEqual({
                [invite_service_d_1.InviteEvents.INVITATION_CREATED]: expect.any(Function)
            });
        });
    });
});
