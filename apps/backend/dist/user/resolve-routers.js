"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveRouters = exports.RouterTypes = void 0;
const in_memory_user_repository_1 = __importDefault(require("@/user/in-memory-user-repository"));
const user_router_1 = __importDefault(require("@/user/user-router"));
const user_service_1 = __importDefault(require("@/user/user-service"));
const invite_service_1 = __importDefault(require("@/invite/invite-service"));
const invite_router_1 = __importDefault(require("@/invite/invite-router"));
const in_memory_invite_repository_1 = __importDefault(require("@/invite/in-memory-invite-repository"));
const create_invite_event_publishers_1 = __importDefault(require("@/invite/create-invite-event-publishers"));
const session_service_1 = __importDefault(require("@/session/session-service"));
const in_memory_session_repository_1 = __importDefault(require("@/session/in-memory-session-repository"));
const game_service_1 = __importDefault(require("@/game/game-service"));
const in_memory_game_repository_1 = __importDefault(require("@/game/in-memory-game-repository"));
const game_1 = __importDefault(require("@/game/game"));
const session_router_1 = __importDefault(require("@/session/session-router"));
var RouterTypes;
(function (RouterTypes) {
    RouterTypes[RouterTypes["userRouter"] = 0] = "userRouter";
    RouterTypes[RouterTypes["inviteRouter"] = 1] = "inviteRouter";
    RouterTypes[RouterTypes["sessionRouter"] = 2] = "sessionRouter";
})(RouterTypes || (exports.RouterTypes = RouterTypes = {}));
const resolveRouters = ({ stage, keySet, authority, internalEventPublisher = () => Promise.resolve() }) => {
    const userRepository = stage === 'PRODUCTION'
        ? new in_memory_user_repository_1.default()
        : new in_memory_user_repository_1.default();
    const inviteRepository = stage === 'PRODUCTION'
        ? new in_memory_invite_repository_1.default()
        : new in_memory_invite_repository_1.default();
    const gameRepository = stage === 'PRODUCTION'
        ? new in_memory_game_repository_1.default()
        : new in_memory_game_repository_1.default();
    const sessionRepository = stage === 'PRODUCTION'
        ? new in_memory_session_repository_1.default()
        : new in_memory_session_repository_1.default();
    const userService = new user_service_1.default(userRepository);
    const gameService = new game_service_1.default(gameRepository, (...args) => new game_1.default(...args));
    const sessionService = new session_service_1.default(sessionRepository, gameService);
    const inviteService = new invite_service_1.default(userService, sessionService, inviteRepository, (0, create_invite_event_publishers_1.default)(internalEventPublisher));
    return {
        [RouterTypes.userRouter]: (0, user_router_1.default)(userService, keySet, authority),
        [RouterTypes.inviteRouter]: (0, invite_router_1.default)(inviteService),
        [RouterTypes.sessionRouter]: (0, session_router_1.default)(sessionService, userService)
    };
};
exports.resolveRouters = resolveRouters;
