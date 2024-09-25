import mongoose, { Model } from 'mongoose';
import { BoardCell } from '@/connect-4-domain/game-types';
import parseAsciiTable from '@/connect-4-domain/parse-ascii-table';
import {
    afterAll,
    afterEach,
    beforeAll,
    beforeEach,
    describe,
    expect,
    it
} from 'vitest';
import { PersistedGame, GameStatus } from '@/connect-4-domain/game-types';
import { v4 as uuidv4 } from 'uuid';
import MongoGameRepository, {
    GameDocument,
    gameSchema
} from '@/connect-4-domain/mongo-game-repository';

describe('mongo-game-repository', () => {
    const customResolver = (value: string): BoardCell => {
        const parsedValue = Number.parseInt(value);

        if (parsedValue === 1 || parsedValue === 2) {
            return {
                player: parsedValue
            };
        }

        return {
            player: undefined
        };
    };

    beforeAll(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(import.meta.env.VITE_MONGODB_URI!);
        }
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe('given defaults', () => {
        it('creates a mongo game repository', async () => {
            const repository = new MongoGameRepository();
            expect(repository).toBeInstanceOf(MongoGameRepository);
        });
        it('loads a saved game', async () => {
            const repository = new MongoGameRepository();
            const asciiTable = `
            |---|---|---|---|
            |   |   |   |   |
            |---|---|---|---|
            |   |   |   |   |
            |---|---|---|---|`;
            const persistedGame: PersistedGame = {
                board: parseAsciiTable(asciiTable, customResolver),
                activePlayer: 1,
                playerStats: {
                    1: { playerNumber: 1, remainingDiscs: 4 },
                    2: { playerNumber: 2, remainingDiscs: 4 }
                },
                gameStatus: 'IN_PROGRESS' as GameStatus
            };
            const gameId = await repository.save(persistedGame);
            expect(await repository.load(gameId)).toMatchObject(persistedGame);
            await mongoose.connection.db?.dropDatabase();
        });
        it('returns undefined when loading a non-existent game', async () => {
            const repository = new MongoGameRepository();
            const gameId = uuidv4();
            expect(await repository.load(gameId)).toBe(undefined);
        });
        it('deletes a saved game', async () => {
            const repository = new MongoGameRepository();
            const asciiTable = `
|---|---|---|---|
|   |   |   |   |
|---|---|---|---|
|   |   |   |   |
|---|---|---|---|`;
            const persistedGame: PersistedGame = {
                board: parseAsciiTable(asciiTable, customResolver),
                activePlayer: 1,
                playerStats: {
                    1: { playerNumber: 1, remainingDiscs: 4 },
                    2: { playerNumber: 2, remainingDiscs: 4 }
                },
                gameStatus: 'IN_PROGRESS' as GameStatus
            };
            const gameId = await repository.save(persistedGame);
            await repository.delete(gameId);
            expect(await repository.load(gameId)).toBe(undefined);
        });
        it('throws an error when deleting a non-existent game', async () => {
            const repository = new MongoGameRepository();
            const gameId = uuidv4();
            await expect(repository.delete(gameId)).rejects.toThrow(
                'Game does not exist in the repository.'
            );
        });
    });
    describe('given a store', () => {
        const asciiTable = `
|---|---|---|---|
|   |   |   |   |
|---|---|---|---|
|   |   |   |   |
|---|---|---|---|`;

        let gameModel: Model<GameDocument>;
        let repository: MongoGameRepository;

        beforeEach(async () => {
            gameModel = mongoose.model<GameDocument>('Game', gameSchema);
            repository = new MongoGameRepository(gameModel);
        });

        afterEach(async () => {
            await mongoose.connection.db?.dropDatabase();
        });

        it('saves a game', async () => {
            const persistedGame: PersistedGame = {
                board: parseAsciiTable(asciiTable, customResolver),
                activePlayer: 1,
                playerStats: {
                    1: { playerNumber: 1, remainingDiscs: 4 },
                    2: { playerNumber: 2, remainingDiscs: 4 }
                },
                gameStatus: 'IN_PROGRESS' as GameStatus
            };
            const gameId = await repository.save(persistedGame);
            const gameToLoad = await gameModel.findOne({ gameUuid: gameId });
            const expectedGame =
                gameToLoad !== null
                    ? {
                          board: gameToLoad.board,
                          activePlayer: gameToLoad.activePlayer,
                          players: gameToLoad.playerStats,
                          status: gameToLoad.gameStatus
                      }
                    : undefined;

            expect(expectedGame).toMatchObject(persistedGame);
        });
        it('saves a game with a provided UUID', async () => {
            const gameId = uuidv4();
            const persistedGame: PersistedGame = {
                board: parseAsciiTable(asciiTable, customResolver),
                activePlayer: 1,
                playerStats: {
                    1: { playerNumber: 1, remainingDiscs: 4 },
                    2: { playerNumber: 2, remainingDiscs: 4 }
                },
                gameStatus: 'IN_PROGRESS' as GameStatus
            };
            const retrievedGameId = await repository.save(
                persistedGame,
                gameId
            );
            expect(retrievedGameId).toBe(gameId);
            expect(
                await gameModel.findOne({ gameUuid: retrievedGameId }).exec()
            ).toMatchObject(persistedGame);
        });
        it('loads a saved game', async () => {
            const persistedGame: PersistedGame = {
                board: parseAsciiTable(asciiTable, customResolver),
                activePlayer: 1,
                playerStats: {
                    1: { playerNumber: 1, remainingDiscs: 4 },
                    2: { playerNumber: 2, remainingDiscs: 4 }
                },
                gameStatus: 'IN_PROGRESS' as GameStatus
            };
            const gameId = await repository.save(persistedGame);
            expect(await repository.load(gameId)).toMatchObject(persistedGame);
        });
        it('returns undefined when loading a non-existent game', async () => {
            const gameId = uuidv4();
            expect(await repository.load(gameId)).toBe(undefined);
        });
    });
});
