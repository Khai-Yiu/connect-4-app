"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoSuchGameError = void 0;
const game_types_d_1 = require("@/game/game-types.d");
class NoSuchGameError extends Error {
}
exports.NoSuchGameError = NoSuchGameError;
class GameService {
    repository;
    gameFactory;
    playerMoveHandler;
    constructor(repository, gameFactory, playerMoveHandler = () => Promise.resolve()) {
        this.repository = repository;
        this.gameFactory = gameFactory;
        this.playerMoveHandler = playerMoveHandler;
    }
    async createGame() {
        const game = this.gameFactory();
        const { uuid } = await this.repository.saveGame(game.getDetails());
        return uuid;
    }
    async getGameDetails(gameUuid) {
        return await this.repository.loadGame(gameUuid);
    }
    async submitMove(gameUuid, playerMove) {
        const gameDetails = await this.repository.loadGame(gameUuid);
        const game = this.gameFactory(gameDetails);
        const moveResult = game.move(playerMove);
        await this.repository.saveGame(game.getDetails());
        if (moveResult.moveSuccessful) {
            this.playerMoveHandler({
                type: game_types_d_1.GameEvents.PLAYER_MOVED,
                payload: {
                    player: playerMove.player,
                    targetCell: playerMove.targetCell
                }
            });
        }
        return moveResult;
    }
}
exports.default = GameService;
