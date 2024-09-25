import { GameRepository } from '@/connect-4-domain/game';
import { GameUuid, PersistedGame } from '@/connect-4-domain/game-types';
import { v4 as uuidv4 } from 'uuid';

type Store = Map<GameUuid, PersistedGame>;

export default class InMemoryRepository implements GameRepository {
    private store: Map<GameUuid, PersistedGame>;

    constructor(store: Store = new Map<GameUuid, PersistedGame>()) {
        this.store = store;
    }

    async save(
        persistedGame: PersistedGame,
        gameUuid: GameUuid = uuidv4()
    ): Promise<GameUuid> {
        this.store.set(gameUuid, persistedGame);

        return gameUuid;
    }

    async load(gameUuid: GameUuid): Promise<PersistedGame | undefined> {
        return this.store.get(gameUuid);
    }

    async delete(gameUuid: GameUuid): Promise<void> {
        const isDeleted = this.store.delete(gameUuid);

        if (!isDeleted) {
            throw new Error('Game does not exist in the repository.');
        }
    }
}
