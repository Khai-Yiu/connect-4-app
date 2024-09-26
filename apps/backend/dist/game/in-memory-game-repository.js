"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class InMemoryGameRepository {
    games;
    constructor() {
        this.games = new Map();
    }
    async saveGame(gameDetails) {
        const uuid = crypto.randomUUID();
        const persistedGameDetails = {
            uuid,
            ...gameDetails
        };
        this.games.set(persistedGameDetails.uuid, persistedGameDetails);
        return persistedGameDetails;
    }
    async loadGame(gameUuid) {
        return this.games.get(gameUuid);
    }
}
exports.default = InMemoryGameRepository;
