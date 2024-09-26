"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActiveGameInProgressError = void 0;
const in_memory_session_repository_d_1 = require("@/session/in-memory-session-repository.d");
class ActiveGameInProgressError extends Error {
}
exports.ActiveGameInProgressError = ActiveGameInProgressError;
class InMemorySessionRepository {
    sessions;
    constructor() {
        this.sessions = new Map();
    }
    async create({ inviterUuid, inviteeUuid }) {
        const sessionUuid = crypto.randomUUID();
        const sessionDetails = {
            uuid: sessionUuid,
            inviter: {
                uuid: inviterUuid
            },
            invitee: {
                uuid: inviteeUuid
            },
            status: in_memory_session_repository_d_1.SessionStatus.IN_PROGRESS,
            games: new Map()
        };
        this.sessions.set(sessionUuid, sessionDetails);
        return sessionDetails;
    }
    async getSession(sessionUuid) {
        return this.sessions.get(sessionUuid);
    }
    async addGame(sessionUuid, gameUuid, startingPlayerUuid) {
        const sessionDetails = await this.getSession(sessionUuid);
        const gameMetadata = {
            gameUuid,
            playerOneUuid: startingPlayerUuid,
            playerTwoUuid: startingPlayerUuid === sessionDetails.inviter.uuid
                ? sessionDetails.invitee.uuid
                : sessionDetails.inviter.uuid
        };
        sessionDetails.games.set(gameUuid, gameMetadata);
        return sessionDetails;
    }
    async setActiveGame(sessionUuid, gameUuid) {
        const sessionDetails = await this.getSession(sessionUuid);
        sessionDetails.activeGameUuid = gameUuid;
        return sessionDetails;
    }
    async unsetActiveGame(sessionUuid) {
        const sessionDetails = await this.getSession(sessionUuid);
        sessionDetails.activeGameUuid = undefined;
        return sessionDetails;
    }
}
exports.default = InMemorySessionRepository;
