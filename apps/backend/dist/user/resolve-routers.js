import InMemoryUserRepositoryFactory from '@/user/in-memory-user-repository';
import userRouterFactory from '@/user/user-router';
import UserService from '@/user/user-service';
import InviteService from '@/invite/invite-service';
import inviteRouterFactory from '@/invite/invite-router';
import InMemoryInviteRepository from '@/invite/in-memory-invite-repository';
import createInviteEventPublishers from '@/invite/create-invite-event-publishers';
import SessionService from '@/session/session-service';
import InMemorySessionRepository from '@/session/in-memory-session-repository';
import GameService from '@/game/game-service';
import InMemoryGameRepository from '@/game/in-memory-game-repository';
import Game from '@/game/game';
import sessionRouterFactory from '@/session/session-router';
export var RouterTypes;
(function (RouterTypes) {
    RouterTypes[RouterTypes["userRouter"] = 0] = "userRouter";
    RouterTypes[RouterTypes["inviteRouter"] = 1] = "inviteRouter";
    RouterTypes[RouterTypes["sessionRouter"] = 2] = "sessionRouter";
})(RouterTypes || (RouterTypes = {}));
export const resolveRouters = ({ stage, keySet, authority, internalEventPublisher = () => Promise.resolve() }) => {
    const userRepository = stage === 'PRODUCTION'
        ? new InMemoryUserRepositoryFactory()
        : new InMemoryUserRepositoryFactory();
    const inviteRepository = stage === 'PRODUCTION'
        ? new InMemoryInviteRepository()
        : new InMemoryInviteRepository();
    const gameRepository = stage === 'PRODUCTION'
        ? new InMemoryGameRepository()
        : new InMemoryGameRepository();
    const sessionRepository = stage === 'PRODUCTION'
        ? new InMemorySessionRepository()
        : new InMemorySessionRepository();
    const userService = new UserService(userRepository);
    const gameService = new GameService(gameRepository, (...args) => new Game(...args));
    const sessionService = new SessionService(sessionRepository, gameService);
    const inviteService = new InviteService(userService, sessionService, inviteRepository, createInviteEventPublishers(internalEventPublisher));
    return {
        [RouterTypes.userRouter]: userRouterFactory(userService, keySet, authority),
        [RouterTypes.inviteRouter]: inviteRouterFactory(inviteService),
        [RouterTypes.sessionRouter]: sessionRouterFactory(sessionService, userService)
    };
};
