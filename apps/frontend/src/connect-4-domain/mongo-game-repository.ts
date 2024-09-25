import mongoose, { Document, Model } from 'mongoose';
import { GameRepository } from '@/connect-4-domain/game';
import { v4 as uuidv4 } from 'uuid';
import {
    GameStatus,
    GameUuid,
    PersistedGame
} from '@/connect-4-domain/game-types';

export const gameSchema = new mongoose.Schema({
    gameUuid: { type: String, required: true, unique: true },
    board: {
        type: [
            [
                {
                    player: { type: Number, required: false }
                }
            ]
        ],
        required: true
    },
    activePlayer: { type: Number, required: true },
    players: {
        type: {
            '1': {
                playerNumber: { type: Number, required: true },
                remainingDiscs: { type: Number, required: true }
            },
            '2': {
                playerNumber: { type: Number, required: true },
                remainingDiscs: { type: Number, required: true }
            }
        },
        required: true
    },
    status: { type: String, enum: Object.values(GameStatus), required: true }
});

export interface GameDocument extends Document, PersistedGame {}

export default class MongoGameRepository implements GameRepository {
    private gameModel: Model<GameDocument>;

    constructor(gameModel?: Model<GameDocument>) {
        if (gameModel !== undefined) {
            this.gameModel = gameModel;
        } else {
            this.gameModel = mongoose.model<GameDocument>('Game', gameSchema);
        }
    }

    async save(
        persistedGame: PersistedGame,
        gameUuid: GameUuid = uuidv4()
    ): Promise<GameUuid> {
        try {
            await this.gameModel.create({
                gameUuid,
                board: persistedGame.board,
                activePlayer: persistedGame.activePlayer,
                playerStats: persistedGame.playerStats,
                gameStatus: persistedGame.gameStatus
            });

            return gameUuid;
        } catch (error) {
            throw new Error('Failed to save game.');
        }
    }

    async load(gameUuid: GameUuid): Promise<PersistedGame | undefined> {
        try {
            const gameToLoad = await this.gameModel
                .findOne({ gameUuid })
                .exec();

            if (gameToLoad !== undefined && gameToLoad !== null) {
                return {
                    board: gameToLoad.board,
                    activePlayer: gameToLoad.activePlayer,
                    playerStats: {
                        1: gameToLoad.playerStats['1'],
                        2: gameToLoad.playerStats['2']
                    },
                    gameStatus: gameToLoad.gameStatus
                };
            } else {
                return undefined;
            }
        } catch (error) {
            console.error('Error loading game: ', error);

            return undefined;
        }
    }

    async delete(gameUuid: GameUuid): Promise<void> {
        const { deletedCount } = await this.gameModel.deleteOne({ gameUuid });

        if (deletedCount === 0) {
            throw new Error('Game does not exist in the repository.');
        }
    }
}
