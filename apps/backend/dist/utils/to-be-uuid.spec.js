"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const to_be_uuid_1 = __importDefault(require("@/utils/to-be-uuid"));
describe('toBeUuid', () => {
    describe('given a valid v4 UUID string', () => {
        it('returns a positive MatcherResult', () => {
            const validUuid = '36b8f84d-df4e-4d49-b662-bcde71a8764f';
            expect(to_be_uuid_1.default.call(null, validUuid)).toEqual({
                pass: true,
                message: expect.any(Function)
            });
        });
        it('returns the message function that indicates the UUID is invalid when invoked', () => {
            const validUuid = '36b8f84d-df4e-4d49-b662-bcde71a8764f';
            const { message } = to_be_uuid_1.default.call(null, validUuid);
            expect(message()).toEqual(`${validUuid} is an invalid v4 UUID`);
        });
        describe('and we use the negated matcher', () => {
            it('should return a negative MatchResult', () => {
                const validUuid = '36b8f84d-df4e-4d49-b662-bcde71a8764f';
                const negatedToBeUuid = to_be_uuid_1.default.bind({ isNot: true });
                expect(negatedToBeUuid(validUuid)).toEqual({
                    pass: true,
                    message: expect.any(Function)
                });
            });
            it('returns a message function that indicates the UUID is invalid when invoked', () => {
                const validUuid = '36b8f84d-df4e-4d49-b662-bcde71a8764f';
                const negatedToBeUuid = to_be_uuid_1.default.bind({ isNot: true });
                const { message } = negatedToBeUuid(validUuid);
                expect(message()).toEqual(`${validUuid} is a valid v4 UUID`);
            });
        });
    });
    describe('given an invalid v4 UUID string', () => {
        it('returns a negative MatcherResult', () => {
            const invalidUuid = '36b8f84d-df4e-4d49-b662-bcde71a8764fINVALID';
            expect(to_be_uuid_1.default.call(null, invalidUuid)).toEqual({
                pass: false,
                message: expect.any(Function)
            });
        });
        it('returns the message function that indicates an invalid message when invoked', () => {
            const invalidUuid = '36b8f84d-df4e-4d49-b662-bcde71a8764fINVALID';
            const { message } = to_be_uuid_1.default.call(null, invalidUuid);
            expect(message()).toEqual(`${invalidUuid} is an invalid v4 UUID`);
        });
        describe('and we use the negated matcher', () => {
            it('returns a positive MatcherResult', () => {
                const invalidUuid = '36b8f84d-df4e-4d49-b662-bcde71a8764fINVALID';
                const negatedToBeUuid = to_be_uuid_1.default.bind({ isNot: true });
                expect(negatedToBeUuid(invalidUuid)).toEqual({
                    pass: false,
                    message: expect.any(Function)
                });
            });
            it('returns a message function that indicates the UUID is valid when invoked', () => {
                const invalidUuid = '36b8f84d-df4e-4d49-b662-bcde71a8764fINVALID';
                const negatedToBeUuid = to_be_uuid_1.default.bind({ isNot: true });
                const { message } = negatedToBeUuid(invalidUuid);
                expect(message()).toEqual(`${invalidUuid} is a valid v4 UUID`);
            });
        });
    });
});
