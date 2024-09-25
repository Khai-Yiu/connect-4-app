var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { GameEvents } from '@/game/game-types.d';
export class NoSuchGameError extends Error {
}
export default class GameService {
    constructor(repository, gameFactory, playerMoveHandler = () => Promise.resolve()) {
        this.repository = repository;
        this.gameFactory = gameFactory;
        this.playerMoveHandler = playerMoveHandler;
    }
    createGame() {
        return __awaiter(this, void 0, void 0, function* () {
            const game = this.gameFactory();
            const { uuid } = yield this.repository.saveGame(game.getDetails());
            return uuid;
        });
    }
    getGameDetails(gameUuid) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.repository.loadGame(gameUuid);
        });
    }
    submitMove(gameUuid, playerMove) {
        return __awaiter(this, void 0, void 0, function* () {
            const gameDetails = yield this.repository.loadGame(gameUuid);
            const game = this.gameFactory(gameDetails);
            const moveResult = game.move(playerMove);
            yield this.repository.saveGame(game.getDetails());
            if (moveResult.moveSuccessful) {
                this.playerMoveHandler({
                    type: GameEvents.PLAYER_MOVED,
                    payload: {
                        player: playerMove.player,
                        targetCell: playerMove.targetCell
                    }
                });
            }
            return moveResult;
        });
    }
}
