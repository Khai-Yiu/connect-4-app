import { PlayerMove } from '@/connect-4-domain/game-types';

type Payload = PlayerMove;

enum CommandTypes {
    MOVE_PLAYER = 'MOVE_PLAYER'
}

export function createMovePlayerCommand(payload: Payload): MovePlayerCommand {
    return new MovePlayerCommand(payload);
}

export class MovePlayerCommand {
    type: string;
    payload: Payload;

    constructor(payload: Payload) {
        this.type = CommandTypes.MOVE_PLAYER;
        this.payload = payload;
    }
}
