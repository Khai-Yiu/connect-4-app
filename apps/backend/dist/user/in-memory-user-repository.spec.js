var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import InMemoryUserRepositoryFactory from '@/user/in-memory-user-repository';
describe('in-memory-user-repository', () => {
    describe('given the details for a user who does not exist', () => {
        it('creates the user', () => __awaiter(void 0, void 0, void 0, function* () {
            const inMemoryUserRepository = new InMemoryUserRepositoryFactory();
            const createdUser = yield inMemoryUserRepository.create({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@gmail.com',
                password: '$argon2id$v=19$m=65536,t=3,p=4$69uuSYaO9KQmE/83AXUpOA$0E+BlpapwGDhLuToVg1+chQrWOmPrYe+My6CCStF+GM'
            });
            expect(createdUser).toEqual(expect.objectContaining({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@gmail.com',
                password: '$argon2id$v=19$m=65536,t=3,p=4$69uuSYaO9KQmE/83AXUpOA$0E+BlpapwGDhLuToVg1+chQrWOmPrYe+My6CCStF+GM',
                uuid: expect.toBeUuid()
            }));
        }));
    });
    describe('given an email address', () => {
        it('returns a list of users associated with the email', () => __awaiter(void 0, void 0, void 0, function* () {
            const inMemoryUserRepository = new InMemoryUserRepositoryFactory();
            yield inMemoryUserRepository.create({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@gmail.com',
                password: '$argon2id$v=19$m=65536,t=3,p=4$69uuSYaO9KQmE/83AXUpOA$0E+BlpapwGDhLuToVg1+chQrWOmPrYe+My6CCStF+GM'
            });
            yield inMemoryUserRepository.create({
                firstName: 'Jonathan',
                lastName: 'Doe',
                email: 'john.doe2@gmail.com',
                password: '$argon2id$v=19$m=65536,t=3,p=4$69uuSYaO9KQmE/83AXUpOA$0E+BlpapwGDhLuToVg1+chQrWOmPrYe+My6CCStF+GM'
            });
            const users = yield inMemoryUserRepository.findByEmail('john.doe@gmail.com');
            expect(users).toEqual([
                {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@gmail.com',
                    password: '$argon2id$v=19$m=65536,t=3,p=4$69uuSYaO9KQmE/83AXUpOA$0E+BlpapwGDhLuToVg1+chQrWOmPrYe+My6CCStF+GM',
                    uuid: expect.toBeUuid()
                }
            ]);
        }));
    });
    describe('given a uuid', () => {
        it('returns the user details', () => __awaiter(void 0, void 0, void 0, function* () {
            const inMemoryUserRepository = new InMemoryUserRepositoryFactory();
            const { uuid } = yield inMemoryUserRepository.create({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@gmail.com',
                password: '$argon2id$v=19$m=65536,t=3,p=4$69uuSYaO9KQmE/83AXUpOA$0E+BlpapwGDhLuToVg1+chQrWOmPrYe+My6CCStF+GM'
            });
            const users = yield inMemoryUserRepository.findByUuid(uuid);
            expect(users).toEqual({
                uuid,
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@gmail.com',
                password: '$argon2id$v=19$m=65536,t=3,p=4$69uuSYaO9KQmE/83AXUpOA$0E+BlpapwGDhLuToVg1+chQrWOmPrYe+My6CCStF+GM'
            });
        }));
    });
});
