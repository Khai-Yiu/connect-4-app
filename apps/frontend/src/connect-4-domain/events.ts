type PlayerMovedFailedEventPayload = {
    message: string;
};

type PlayerMovedEventPayload = {
    player: 1 | 2;
    targetCell: {
        row: number;
        column: number;
    };
};

export enum EventTypes {
    PLAYER_MOVE_FAILED = 'PLAYER_MOVE_FAILED',
    PLAYER_MOVED = 'PLAYER_MOVED'
}

export function createPlayerMoveFailedEvent(
    eventPayload: PlayerMovedFailedEventPayload
): PlayerMoveFailedEvent {
    return new PlayerMoveFailedEvent(eventPayload);
}

export class PlayerMoveFailedEvent {
    type: string;
    payload: PlayerMovedFailedEventPayload;

    constructor(eventPayload: PlayerMovedFailedEventPayload) {
        this.type = EventTypes.PLAYER_MOVE_FAILED;
        this.payload = eventPayload;
    }
}

export function createPlayerMovedEvent(
    eventPayload: PlayerMovedEventPayload
): PlayerMovedEvent {
    return new PlayerMovedEvent(eventPayload);
}

export class PlayerMovedEvent {
    type: string;
    payload: PlayerMovedEventPayload;

    constructor(eventPayload: PlayerMovedEventPayload) {
        this.type = EventTypes.PLAYER_MOVED;
        this.payload = eventPayload;
    }
}
