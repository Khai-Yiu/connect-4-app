var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import InMemoryInviteRepository from '@/invite/in-memory-invite-repository';
import { InviteStatus } from './invite-service.d';
describe('in-memory-invite-repository', () => {
    describe('given details of an invite', () => {
        it('creates the invite', () => __awaiter(void 0, void 0, void 0, function* () {
            const repository = new InMemoryInviteRepository();
            const inviteDetails = {
                inviter: 'player1@gmail.com',
                invitee: 'player2@gmail.com',
                exp: 1000,
                status: 'PENDING'
            };
            const createdInvite = yield repository.create(inviteDetails);
            expect(createdInvite).toEqual({
                uuid: expect.toBeUuid(),
                inviter: 'player1@gmail.com',
                invitee: 'player2@gmail.com',
                exp: 1000,
                status: 'PENDING'
            });
        }));
    });
    describe('given an invite exists', () => {
        describe('and an email is provided', () => {
            it('returns all invites associated with that email', () => __awaiter(void 0, void 0, void 0, function* () {
                const repository = new InMemoryInviteRepository();
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
                yield repository.create(receivedInviteDetails);
                yield repository.create(forwardedInviteDetails);
                const invites = yield repository.findReceivedInvitesByEmail('player2@gmail.com');
                expect(invites).toEqual([
                    {
                        uuid: expect.toBeUuid(),
                        inviter: 'player1@gmail.com',
                        invitee: 'player2@gmail.com',
                        exp: 1000,
                        status: 'PENDING'
                    }
                ]);
            }));
        });
    });
    describe('retrieving an invite', () => {
        describe('given an invite', () => {
            it('returns details about the invite', () => __awaiter(void 0, void 0, void 0, function* () {
                const repository = new InMemoryInviteRepository();
                const { uuid } = yield repository.create({
                    inviter: 'player1@gmail.com',
                    invitee: 'player2@gmail.com',
                    exp: 1000,
                    status: InviteStatus.PENDING
                });
                const inviteDetails = yield repository.findInviteById(uuid);
                expect(inviteDetails).toEqual({
                    uuid,
                    inviter: 'player1@gmail.com',
                    invitee: 'player2@gmail.com',
                    exp: 1000,
                    status: 'PENDING'
                });
            }));
        });
    });
});
