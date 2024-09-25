var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _SessionService_instances, _SessionService_mapPlayerNumberToPlayerUuid;
export class NoSuchSessionError extends Error {
}
export class ActiveGameInProgressError extends Error {
}
class SessionService {
    constructor(repository, gameService) {
        _SessionService_instances.add(this);
        this.repository = repository;
        this.gameService = gameService;
    }
    createSession(sessionCreationDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.repository.create(sessionCreationDetails);
        });
    }
    getSession(sessionUuid) {
        return __awaiter(this, void 0, void 0, function* () {
            const sessionDetails = yield this.repository.getSession(sessionUuid);
            if (sessionDetails === undefined) {
                throw new NoSuchSessionError();
            }
            return sessionDetails;
        });
    }
    getGameUuids(sessionUuid) {
        return __awaiter(this, void 0, void 0, function* () {
            const sessionDetails = yield this.getSession(sessionUuid);
            return [...sessionDetails.games.keys()];
        });
    }
    getActiveGameUuid(sessionUuid) {
        return __awaiter(this, void 0, void 0, function* () {
            const sessionDetails = yield this.getSession(sessionUuid);
            return sessionDetails.activeGameUuid;
        });
    }
    getActivePlayer(sessionUuid) {
        return __awaiter(this, void 0, void 0, function* () {
            const sessionDetails = yield this.getSession(sessionUuid);
            const { activePlayer } = yield this.gameService.getGameDetails(sessionDetails.activeGameUuid);
            return __classPrivateFieldGet(this, _SessionService_instances, "m", _SessionService_mapPlayerNumberToPlayerUuid).call(this, activePlayer, sessionDetails.games.get(sessionDetails.activeGameUuid));
        });
    }
    addNewGame(sessionUuid, startingPlayerUuid) {
        return __awaiter(this, void 0, void 0, function* () {
            const activeGameUuid = yield this.getActiveGameUuid(sessionUuid);
            if (activeGameUuid !== undefined) {
                throw new ActiveGameInProgressError();
            }
            const newGameUuid = yield this.gameService.createGame();
            yield this.repository.addGame(sessionUuid, newGameUuid, startingPlayerUuid);
            yield this.repository.setActiveGame(sessionUuid, newGameUuid);
            return newGameUuid;
        });
    }
    completeActiveGame(sessionUuid) {
        return __awaiter(this, void 0, void 0, function* () {
            const completeGameUuid = (yield this.repository.getSession(sessionUuid))
                .uuid;
            this.repository.unsetActiveGame(sessionUuid);
            return completeGameUuid;
        });
    }
    submitMove(sessionUuid, playerUuid, move) {
        return __awaiter(this, void 0, void 0, function* () {
            const { inviter: { uuid }, activeGameUuid } = yield this.repository.getSession(sessionUuid);
            return yield this.gameService.submitMove(activeGameUuid, {
                player: playerUuid === uuid ? 1 : 2,
                targetCell: move
            });
        });
    }
}
_SessionService_instances = new WeakSet(), _SessionService_mapPlayerNumberToPlayerUuid = function _SessionService_mapPlayerNumberToPlayerUuid(playerNumber, gameMetadata) {
    return __awaiter(this, void 0, void 0, function* () {
        return playerNumber === 1
            ? gameMetadata.playerOneUuid
            : gameMetadata.playerTwoUuid;
    });
};
export default SessionService;
