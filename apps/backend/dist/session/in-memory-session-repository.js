var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { SessionStatus } from '@/session/in-memory-session-repository.d';
export class ActiveGameInProgressError extends Error {
}
export default class InMemorySessionRepository {
    constructor() {
        this.sessions = new Map();
    }
    create(_a) {
        return __awaiter(this, arguments, void 0, function* ({ inviterUuid, inviteeUuid }) {
            const sessionUuid = crypto.randomUUID();
            const sessionDetails = {
                uuid: sessionUuid,
                inviter: {
                    uuid: inviterUuid
                },
                invitee: {
                    uuid: inviteeUuid
                },
                status: SessionStatus.IN_PROGRESS,
                games: new Map()
            };
            this.sessions.set(sessionUuid, sessionDetails);
            return sessionDetails;
        });
    }
    getSession(sessionUuid) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.sessions.get(sessionUuid);
        });
    }
    addGame(sessionUuid, gameUuid, startingPlayerUuid) {
        return __awaiter(this, void 0, void 0, function* () {
            const sessionDetails = yield this.getSession(sessionUuid);
            const gameMetadata = {
                gameUuid,
                playerOneUuid: startingPlayerUuid,
                playerTwoUuid: startingPlayerUuid === sessionDetails.inviter.uuid
                    ? sessionDetails.invitee.uuid
                    : sessionDetails.inviter.uuid
            };
            sessionDetails.games.set(gameUuid, gameMetadata);
            return sessionDetails;
        });
    }
    setActiveGame(sessionUuid, gameUuid) {
        return __awaiter(this, void 0, void 0, function* () {
            const sessionDetails = yield this.getSession(sessionUuid);
            sessionDetails.activeGameUuid = gameUuid;
            return sessionDetails;
        });
    }
    unsetActiveGame(sessionUuid) {
        return __awaiter(this, void 0, void 0, function* () {
            const sessionDetails = yield this.getSession(sessionUuid);
            sessionDetails.activeGameUuid = undefined;
            return sessionDetails;
        });
    }
}
