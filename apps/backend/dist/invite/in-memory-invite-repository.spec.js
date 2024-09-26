"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const in_memory_invite_repository_1 = __importDefault(require("@/invite/in-memory-invite-repository"));
const invite_service_d_1 = require("./invite-service.d");
describe('in-memory-invite-repository', () => {
    describe('given details of an invite', () => {
        it('creates the invite', async () => {
            const repository = new in_memory_invite_repository_1.default();
            const inviteDetails = {
                inviter: 'player1@gmail.com',
                invitee: 'player2@gmail.com',
                exp: 1000,
                status: 'PENDING'
            };
            const createdInvite = await repository.create(inviteDetails);
            expect(createdInvite).toEqual({
                uuid: expect.toBeUuid(),
                inviter: 'player1@gmail.com',
                invitee: 'player2@gmail.com',
                exp: 1000,
                status: 'PENDING'
            });
        });
    });
    describe('given an invite exists', () => {
        describe('and an email is provided', () => {
            it('returns all invites associated with that email', async () => {
                const repository = new in_memory_invite_repository_1.default();
                const receivedInviteDetails = {
                    inviter: 'player1@gmail.com',
                    invitee: 'player2@gmail.com',
                    exp: 1000,
                    status: 'PENDING'
                };
                const forwardedInviteDetails = {
                    inviter: 'player2@gmail.com',
                    invitee: 'player1@gmail.com',
                    exp: 1000,
                    status: 'PENDING'
                };
                await repository.create(receivedInviteDetails);
                await repository.create(forwardedInviteDetails);
                const invites = await repository.findReceivedInvitesByEmail('player2@gmail.com');
                expect(invites).toEqual([
                    {
                        uuid: expect.toBeUuid(),
                        inviter: 'player1@gmail.com',
                        invitee: 'player2@gmail.com',
                        exp: 1000,
                        status: 'PENDING'
                    }
                ]);
            });
        });
    });
    describe('retrieving an invite', () => {
        describe('given an invite', () => {
            it('returns details about the invite', async () => {
                const repository = new in_memory_invite_repository_1.default();
                const { uuid } = await repository.create({
                    inviter: 'player1@gmail.com',
                    invitee: 'player2@gmail.com',
                    exp: 1000,
                    status: invite_service_d_1.InviteStatus.PENDING
                });
                const inviteDetails = await repository.findInviteById(uuid);
                expect(inviteDetails).toEqual({
                    uuid,
                    inviter: 'player1@gmail.com',
                    invitee: 'player2@gmail.com',
                    exp: 1000,
                    status: 'PENDING'
                });
            });
        });
    });
});
