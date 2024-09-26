"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActiveGameInProgressError = exports.NoSuchSessionError = void 0;
class NoSuchSessionError extends Error {
}
exports.NoSuchSessionError = NoSuchSessionError;
class ActiveGameInProgressError extends Error {
}
exports.ActiveGameInProgressError = ActiveGameInProgressError;
class SessionService {
    repository;
    gameService;
    constructor(repository, gameService) {
        this.repository = repository;
        this.gameService = gameService;
    }
    async createSession(sessionCreationDetails) {
        return await this.repository.create(sessionCreationDetails);
    }
    async getSession(sessionUuid) {
        const sessionDetails = await this.repository.getSession(sessionUuid);
        if (sessionDetails === undefined) {
            throw new NoSuchSessionError();
        }
        return sessionDetails;
    }
    async getGameUuids(sessionUuid) {
        const sessionDetails = await this.getSession(sessionUuid);
        return [...sessionDetails.games.keys()];
    }
    async getActiveGameUuid(sessionUuid) {
        const sessionDetails = await this.getSession(sessionUuid);
        return sessionDetails.activeGameUuid;
    }
    async getActivePlayer(sessionUuid) {
        const sessionDetails = await this.getSession(sessionUuid);
        const { activePlayer } = await this.gameService.getGameDetails(sessionDetails.activeGameUuid);
        return this.#mapPlayerNumberToPlayerUuid(activePlayer, sessionDetails.games.get(sessionDetails.activeGameUuid));
    }
    async #mapPlayerNumberToPlayerUuid(playerNumber, gameMetadata) {
        return playerNumber === 1
            ? gameMetadata.playerOneUuid
            : gameMetadata.playerTwoUuid;
    }
    async addNewGame(sessionUuid, startingPlayerUuid) {
        const activeGameUuid = await this.getActiveGameUuid(sessionUuid);
        if (activeGameUuid !== undefined) {
            throw new ActiveGameInProgressError();
        }
        const newGameUuid = await this.gameService.createGame();
        await this.repository.addGame(sessionUuid, newGameUuid, startingPlayerUuid);
        await this.repository.setActiveGame(sessionUuid, newGameUuid);
        return newGameUuid;
    }
    async completeActiveGame(sessionUuid) {
        const completeGameUuid = (await this.repository.getSession(sessionUuid))
            .uuid;
        this.repository.unsetActiveGame(sessionUuid);
        return completeGameUuid;
    }
    async submitMove(sessionUuid, playerUuid, move) {
        const { inviter: { uuid }, activeGameUuid } = await this.repository.getSession(sessionUuid);
        return await this.gameService.submitMove(activeGameUuid, {
            player: playerUuid === uuid ? 1 : 2,
            targetCell: move
        });
    }
}
exports.default = SessionService;
