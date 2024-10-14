import SignupService from '@/services/signup-service';

describe('signup-service', () => {
    let signupService: SignupService;

    beforeEach(() => {
        signupService = createSignupService({});
    });

    describe('given valid user details', () => {
        it('signs up the user', () => {
            const signupDetails = {
                firstName: 'player',
                lastName: 'one',
                email: 'player1@gmail.com',
                password: 'Hello123'
            };

            expect(signupService.signup(signupDetails)).resolves.toEqual({
                isSuccessful: true,
                token: expect.any(String)
            });
        });
    });
});
