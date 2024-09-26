"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const validate_user_signup_request_body_1 = __importDefault(require("@/user/validate-user-signup-request-body"));
describe('validate-user-signup-request-body', () => {
    describe('given a well-formatted user signup request body', () => {
        it('passes validation', () => {
            const userSignupRequestBody = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@gmail.com',
                password: 'Hello123'
            };
            const validationResult = (0, validate_user_signup_request_body_1.default)(userSignupRequestBody);
            expect(validationResult).toEqual({ isValid: true });
        });
    });
    describe('given a user signup request body missing a field', () => {
        it('fails validation', () => {
            const userSignupRequestBody = {
                firstName: 'Dung',
                lastName: 'Eater',
                email: 'dung.eater@gmail.com'
            };
            const validationResult = (0, validate_user_signup_request_body_1.default)(userSignupRequestBody);
            expect(validationResult).toEqual({
                isValid: false,
                errors: [
                    {
                        message: '"password" is required',
                        path: 'password'
                    }
                ]
            });
        });
    });
    describe('given a user signup request body missing multiple fields', () => {
        it('fails validation', () => {
            const userSignupRequestBody = {
                firstName: 'Dempsey',
                password: 'NotSecure'
            };
            const validationResult = (0, validate_user_signup_request_body_1.default)(userSignupRequestBody);
            expect(validationResult).toEqual({
                isValid: false,
                errors: [
                    {
                        message: '"lastName" is required',
                        path: 'lastName'
                    },
                    {
                        message: '"email" is required',
                        path: 'email'
                    }
                ]
            });
        });
    });
});
