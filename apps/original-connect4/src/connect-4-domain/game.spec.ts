import {
    MovePlayerCommand,
    createMovePlayerCommand
} from '@/connect-4-domain/commands';
import {
    PlayerMoveFailedEvent,
    PlayerMovedEvent
} from '@/connect-4-domain/events';
import GameFactory, {
    InvalidBoardDimensionsError
} from '@/connect-4-domain/game';
import { BoardCell, PersistedGame } from '@/connect-4-domain/game-types';
import InMemoryRepository from '@/connect-4-domain/in-memory-repository';
import _toAsciiTable from '@/connect-4-domain/to-ascii-table';
import { pipe } from 'ramda';
import { beforeAll, describe, expect, it } from 'vitest';
import { v4 as uuidv4 } from 'uuid';
import MongoGameRepository from './mongo-game-repository';
import { afterAll } from 'vitest';
import mongoose from 'mongoose';

type MovePlayerCommandPayload = {
    player: 1 | 2;
    targetCell: {
        row: number;
        column: number;
    };
};

function toAsciiTable(board: Array<Array<BoardCell>>): string {
    const cellResolver = (cell: BoardCell) =>
        cell.player === undefined ? '' : `${cell.player}`;

    return _toAsciiTable(board, cellResolver);
}

describe('game', () => {
    describe('new game', () => {
        it(`creates a game where player 1 starts with half the tokens of the number of cells`, () => {
            const game = new GameFactory();
            expect(game.getPlayerStats(1)).toEqual(
                expect.objectContaining({
                    playerNumber: 1,
                    remainingDiscs: 21
                })
            );
        });
        it(`creates a game where player 2 starts with half the tokens of the number of cells`, () => {
            const game = new GameFactory();
            expect(game.getPlayerStats(2)).toEqual(
                expect.objectContaining({
                    playerNumber: 2,
                    remainingDiscs: 21
                })
            );
        });
        it('creates a deep copy of the board', () => {
            const game = new GameFactory();
            const boardOne = game.getBoard();
            const boardTwo = game.getBoard();
            expect(boardTwo).toBeDeeplyUnequal(boardOne);
        });
        it("changes made to the game don't affect prior copies of the board", () => {
            const game = new GameFactory();
            const originalBoard = game.getBoard();
            expect(toAsciiTable(originalBoard)).toMatchInlineSnapshot(`
              "
              |--|--|--|--|--|--|--|
              |  |  |  |  |  |  |  |
              |--|--|--|--|--|--|--|
              |  |  |  |  |  |  |  |
              |--|--|--|--|--|--|--|
              |  |  |  |  |  |  |  |
              |--|--|--|--|--|--|--|
              |  |  |  |  |  |  |  |
              |--|--|--|--|--|--|--|
              |  |  |  |  |  |  |  |
              |--|--|--|--|--|--|--|
              |  |  |  |  |  |  |  |
              |--|--|--|--|--|--|--|"
            `);
            const movePlayerCommand = createMovePlayerCommand({
                player: 1,
                targetCell: {
                    row: 0,
                    column: 0
                }
            });
            game.move(movePlayerCommand);
            expect(toAsciiTable(originalBoard)).toMatchInlineSnapshot(`
              "
              |--|--|--|--|--|--|--|
              |  |  |  |  |  |  |  |
              |--|--|--|--|--|--|--|
              |  |  |  |  |  |  |  |
              |--|--|--|--|--|--|--|
              |  |  |  |  |  |  |  |
              |--|--|--|--|--|--|--|
              |  |  |  |  |  |  |  |
              |--|--|--|--|--|--|--|
              |  |  |  |  |  |  |  |
              |--|--|--|--|--|--|--|
              |  |  |  |  |  |  |  |
              |--|--|--|--|--|--|--|"
            `);
            const boardAfterMove = game.getBoard();
            expect(toAsciiTable(boardAfterMove)).toMatchInlineSnapshot(`
              "
              |---|--|--|--|--|--|--|
              | 1 |  |  |  |  |  |  |
              |---|--|--|--|--|--|--|
              |   |  |  |  |  |  |  |
              |---|--|--|--|--|--|--|
              |   |  |  |  |  |  |  |
              |---|--|--|--|--|--|--|
              |   |  |  |  |  |  |  |
              |---|--|--|--|--|--|--|
              |   |  |  |  |  |  |  |
              |---|--|--|--|--|--|--|
              |   |  |  |  |  |  |  |
              |---|--|--|--|--|--|--|"
            `);
            expect(boardAfterMove).toBeDeeplyUnequal(originalBoard);
        });
        describe('given defaults', () => {
            it('returns an instance of Game', () => {
                const game = new GameFactory();
                expect(game).toBeInstanceOf(GameFactory);
            });
            it('creates a 6x7 board', () => {
                const game = new GameFactory();
                const board = game.getBoard();
                const asciiBoard = toAsciiTable(board);
                expect(asciiBoard).toMatchInlineSnapshot(`
                  "
                  |--|--|--|--|--|--|--|
                  |  |  |  |  |  |  |  |
                  |--|--|--|--|--|--|--|
                  |  |  |  |  |  |  |  |
                  |--|--|--|--|--|--|--|
                  |  |  |  |  |  |  |  |
                  |--|--|--|--|--|--|--|
                  |  |  |  |  |  |  |  |
                  |--|--|--|--|--|--|--|
                  |  |  |  |  |  |  |  |
                  |--|--|--|--|--|--|--|
                  |  |  |  |  |  |  |  |
                  |--|--|--|--|--|--|--|"
                `);
            });
        });
        describe('given custom board dimensions', () => {
            describe('with 0 rows', () => {
                it('throws an error', () => {
                    expect(
                        () =>
                            new GameFactory({
                                boardDimensions: { rows: 0, columns: 7 }
                            })
                    ).toThrowError(
                        new InvalidBoardDimensionsError(
                            'Number of rows must be greater than or equal to 1'
                        )
                    );
                });
            });
            describe('with 0 columns', () => {
                it('throws an error', () => {
                    expect(
                        () =>
                            new GameFactory({
                                boardDimensions: { rows: 6, columns: 0 }
                            })
                    ).toThrowError(
                        new InvalidBoardDimensionsError(
                            'Number of rows must be greater than or equal to 1'
                        )
                    );
                });
            });
            describe('with negative number of rows', () => {
                it('throws an error', () => {
                    expect(
                        () =>
                            new GameFactory({
                                boardDimensions: { rows: -1, columns: 7 }
                            })
                    ).toThrowError(
                        new InvalidBoardDimensionsError(
                            'Number of rows must be greater than or equal to 1'
                        )
                    );
                });
            });
            describe('with negative number of columns', () => {
                it('throws an error', () => {
                    expect(
                        () =>
                            new GameFactory({
                                boardDimensions: { rows: -1, columns: 7 }
                            })
                    ).toThrowError(
                        new InvalidBoardDimensionsError(
                            'Number of rows must be greater than or equal to 1'
                        )
                    );
                });
            });
            describe('which result in an odd number of cells', () => {
                it('throws an error', () => {
                    expect(
                        () =>
                            new GameFactory({
                                boardDimensions: { rows: 3, columns: 3 }
                            })
                    ).toThrowError(
                        new InvalidBoardDimensionsError(
                            `The total number of cells on a board must be even. The supplied board dimensions 3 x 3 result in an odd number of cells`
                        )
                    );
                });
            });
            describe('which result in an even number of cells', () => {
                it('returns an instance of Game', () => {
                    const game = new GameFactory({
                        boardDimensions: { rows: 6, columns: 6 }
                    });
                    const board = game.getBoard();
                    const asciiBoard = toAsciiTable(board);
                    expect(asciiBoard).toMatchInlineSnapshot(`
                      "
                      |--|--|--|--|--|--|
                      |  |  |  |  |  |  |
                      |--|--|--|--|--|--|
                      |  |  |  |  |  |  |
                      |--|--|--|--|--|--|
                      |  |  |  |  |  |  |
                      |--|--|--|--|--|--|
                      |  |  |  |  |  |  |
                      |--|--|--|--|--|--|
                      |  |  |  |  |  |  |
                      |--|--|--|--|--|--|
                      |  |  |  |  |  |  |
                      |--|--|--|--|--|--|"
                    `);
                });
            });
        });
        it('returns the currently active player', () => {
            const game = new GameFactory();
            const player = game.getActivePlayer();
            expect(player).toBe(1);
        });
    });
    describe('making a move', () => {
        describe('given a player is currently active', () => {
            describe("and a cell location that's not on the board", () => {
                it('player should not be able to move to a cell with a row number below the first row', () => {
                    const game = new GameFactory({
                        boardDimensions: { rows: 2, columns: 2 }
                    });
                    expect(toAsciiTable(game.getBoard()))
                        .toMatchInlineSnapshot(`
                      "
                      |--|--|
                      |  |  |
                      |--|--|
                      |  |  |
                      |--|--|"
                    `);
                    const movePlayerCommand = createMovePlayerCommand({
                        player: 1,
                        targetCell: { row: -1, column: 0 }
                    });
                    const event = game.move(movePlayerCommand);
                    expect(event).toEqual({
                        type: 'PLAYER_MOVE_FAILED',
                        payload: {
                            message:
                                "Cell at row -1 and column 0 doesn't exist on the board. The row number must be >= 0 and <= 1"
                        }
                    });
                    expect(toAsciiTable(game.getBoard())).toMatchInlineSnapshot(
                        `
                      "
                      |--|--|
                      |  |  |
                      |--|--|
                      |  |  |
                      |--|--|"
                    `
                    );
                    expect(game.getActivePlayer()).toBe(1);
                });
                it('player should not be able to move to a cell with a row number above the last row', () => {
                    const game = new GameFactory({
                        boardDimensions: { rows: 2, columns: 2 }
                    });
                    const movePlayerCommand = createMovePlayerCommand({
                        player: 1,
                        targetCell: {
                            row: 2,
                            column: 0
                        }
                    });
                    const event = game.move(movePlayerCommand);
                    expect(toAsciiTable(game.getBoard()))
                        .toMatchInlineSnapshot(`
                      "
                      |--|--|
                      |  |  |
                      |--|--|
                      |  |  |
                      |--|--|"
                    `);
                    expect(game.getActivePlayer()).toBe(1);
                    expect(event).toEqual({
                        type: 'PLAYER_MOVE_FAILED',
                        payload: {
                            message:
                                "Cell at row 2 and column 0 doesn't exist on the board. The row number must be >= 0 and <= 1"
                        }
                    });
                });
                it('player should not be able to move to a cell with a column number to the left of the first column', () => {
                    const game = new GameFactory({
                        boardDimensions: { rows: 2, columns: 2 }
                    });
                    const movePlayerCommand = createMovePlayerCommand({
                        player: 1,
                        targetCell: {
                            row: 0,
                            column: -1
                        }
                    });
                    const event = game.move(movePlayerCommand);
                    expect(toAsciiTable(game.getBoard()))
                        .toMatchInlineSnapshot(`
                      "
                      |--|--|
                      |  |  |
                      |--|--|
                      |  |  |
                      |--|--|"
                    `);
                    expect(game.getActivePlayer()).toBe(1);
                    expect(event).toEqual({
                        type: 'PLAYER_MOVE_FAILED',
                        payload: {
                            message:
                                "Cell at row 0 and column -1 doesn't exist on the board. The column number must be >= 0 and <= 1"
                        }
                    });
                });
                it('player should not be able to move to a cell with a column number to the right of the last column', () => {
                    const game = new GameFactory({
                        boardDimensions: { rows: 2, columns: 2 }
                    });
                    const movePlayerCommand = createMovePlayerCommand({
                        player: 1,
                        targetCell: {
                            row: 0,
                            column: 2
                        }
                    });
                    const event = game.move(movePlayerCommand);
                    expect(toAsciiTable(game.getBoard()))
                        .toMatchInlineSnapshot(`
                      "
                      |--|--|
                      |  |  |
                      |--|--|
                      |  |  |
                      |--|--|"
                    `);
                    expect(game.getActivePlayer()).toBe(1);
                    expect(event).toEqual({
                        type: 'PLAYER_MOVE_FAILED',
                        payload: {
                            message:
                                "Cell at row 0 and column 2 doesn't exist on the board. The column number must be >= 0 and <= 1"
                        }
                    });
                });
                it('player should not be able to move to a cell with a row and column number out of bounds', () => {
                    const game = new GameFactory({
                        boardDimensions: { rows: 2, columns: 3 }
                    });
                    const movePlayerCommand = createMovePlayerCommand({
                        player: 1,
                        targetCell: {
                            row: -1,
                            column: -1
                        }
                    });
                    const event = game.move(movePlayerCommand);
                    expect(toAsciiTable(game.getBoard()))
                        .toMatchInlineSnapshot(`
                          "
                          |--|--|--|
                          |  |  |  |
                          |--|--|--|
                          |  |  |  |
                          |--|--|--|"
                        `);
                    expect(game.getActivePlayer()).toBe(1);
                    expect(event).toEqual({
                        type: 'PLAYER_MOVE_FAILED',
                        payload: {
                            message:
                                "Cell at row -1 and column -1 doesn't exist on the board. The row number must be >= 0 and <= 1 and the column number must be >= 0 and <= 2"
                        }
                    });
                });
            });
            describe('and the cell is on the first row', () => {
                describe('and the cell is unoccupied', () => {
                    it('player should be able to move a disc into the cell', () => {
                        const game = new GameFactory({
                            boardDimensions: { rows: 1, columns: 2 }
                        });
                        const movePlayerCommand = createMovePlayerCommand({
                            player: 1,
                            targetCell: {
                                row: 0,
                                column: 0
                            }
                        });
                        expect(toAsciiTable(game.getBoard()))
                            .toMatchInlineSnapshot(`
                        "
                        |--|--|
                        |  |  |
                        |--|--|"
                        `);
                        expect(game.getActivePlayer()).toBe(1);

                        const playerMovedEvent = game.move(movePlayerCommand);
                        expect(playerMovedEvent).toEqual({
                            type: 'PLAYER_MOVED',
                            payload: {
                                player: 1,
                                targetCell: {
                                    row: 0,
                                    column: 0
                                }
                            }
                        });
                        expect(toAsciiTable(game.getBoard()))
                            .toMatchInlineSnapshot(`
                          "
                          |---|--|
                          | 1 |  |
                          |---|--|"
                        `);
                        expect(game.getActivePlayer()).toBe(2);
                    });
                });
                describe('and the cell is occupied', () => {
                    it('the move fails', () => {
                        const game = new GameFactory({
                            boardDimensions: { rows: 1, columns: 2 }
                        });
                        const movePlayerCommand = createMovePlayerCommand({
                            player: 1,
                            targetCell: {
                                row: 0,
                                column: 0
                            }
                        });
                        game.move(movePlayerCommand);
                        expect(toAsciiTable(game.getBoard()))
                            .toMatchInlineSnapshot(`
                              "
                              |---|--|
                              | 1 |  |
                              |---|--|"
                            `);
                        const movePlayerCommand2 = createMovePlayerCommand({
                            player: 2,
                            targetCell: {
                                row: 0,
                                column: 0
                            }
                        });
                        const playerMovedEvent = game.move(movePlayerCommand2);
                        expect(playerMovedEvent).toEqual({
                            type: 'PLAYER_MOVE_FAILED',
                            payload: {
                                message:
                                    'The cell of row 0 and column 0 is already occupied'
                            }
                        });
                        expect(game.getActivePlayer()).toBe(2);
                    });
                });
            });
            describe('and the cell is on the second row', () => {
                describe('and the cell below is occupied', () => {
                    it('player should be able to move a disc into the cell', () => {
                        const game = new GameFactory({
                            boardDimensions: { rows: 2, columns: 2 }
                        });
                        const movePlayerCommand = createMovePlayerCommand({
                            player: 1,
                            targetCell: {
                                row: 0,
                                column: 0
                            }
                        });
                        game.move(movePlayerCommand);
                        expect(toAsciiTable(game.getBoard()))
                            .toMatchInlineSnapshot(`
                              "
                              |---|--|
                              | 1 |  |
                              |---|--|
                              |   |  |
                              |---|--|"
                            `);
                        const movePlayerCommand2 = createMovePlayerCommand({
                            player: 2,
                            targetCell: {
                                row: 1,
                                column: 0
                            }
                        });
                        game.move(movePlayerCommand2);
                        expect(toAsciiTable(game.getBoard()))
                            .toMatchInlineSnapshot(`
                              "
                              |---|--|
                              | 1 |  |
                              |---|--|
                              | 2 |  |
                              |---|--|"
                            `);
                    });
                });
                describe('and the cell below is unoccupied', () => {
                    it('player should not be able to move a disc into the cell', () => {
                        const game = new GameFactory({
                            boardDimensions: { rows: 2, columns: 2 }
                        });
                        const movePlayerCommand = createMovePlayerCommand({
                            player: 1,
                            targetCell: {
                                row: 1,
                                column: 0
                            }
                        });
                        const playerMovedEvent = game.move(movePlayerCommand);
                        expect(playerMovedEvent).toEqual({
                            type: 'PLAYER_MOVE_FAILED',
                            payload: {
                                message:
                                    'The cell of row 1 and column 0 cannot be placed as there is no disc below it'
                            }
                        });
                        expect(toAsciiTable(game.getBoard()))
                            .toMatchInlineSnapshot(`
                              "
                              |--|--|
                              |  |  |
                              |--|--|
                              |  |  |
                              |--|--|"
                            `);
                    });
                });
            });
        });
        describe('given a player is currently inactive', () => {
            it('the player is unable to make a move', () => {
                const game = new GameFactory({
                    boardDimensions: { rows: 2, columns: 2 }
                });
                const movePlayerCommand = createMovePlayerCommand({
                    player: 2,
                    targetCell: {
                        row: 0,
                        column: 0
                    }
                });
                expect(game.getActivePlayer()).toBe(1);
                const playerMovedEvent = game.move(movePlayerCommand);
                expect(playerMovedEvent).toEqual({
                    type: 'PLAYER_MOVE_FAILED',
                    payload: {
                        message:
                            'Player 2 cannot move as player 1 is currently active'
                    }
                });
            });
        });
        describe('given a valid move', () => {
            it("decrements the moving player's tokens by one", () => {
                const game = new GameFactory();
                expect(game.getPlayerStats(1).remainingDiscs).toBe(21);
                game.move(
                    createMovePlayerCommand({
                        player: 1,
                        targetCell: {
                            row: 0,
                            column: 0
                        }
                    })
                );
                expect(game.getPlayerStats(1).remainingDiscs).toBe(20);
            });
        });
        describe('given the game is over', () => {
            describe('as player one has won', () => {
                it('returns a move failed event', () => {
                    const game = new GameFactory({
                        boardDimensions: { rows: 2, columns: 4 }
                    });

                    const payloads = [
                        { player: 1, targetCell: { row: 0, column: 0 } },
                        { player: 2, targetCell: { row: 1, column: 0 } },
                        { player: 1, targetCell: { row: 0, column: 1 } },
                        { player: 2, targetCell: { row: 1, column: 1 } },
                        { player: 1, targetCell: { row: 0, column: 2 } },
                        { player: 2, targetCell: { row: 1, column: 2 } },
                        { player: 1, targetCell: { row: 0, column: 3 } }
                    ] satisfies MovePlayerCommandPayload[];

                    payloads.forEach(
                        pipe<
                            [MovePlayerCommandPayload],
                            MovePlayerCommand,
                            PlayerMovedEvent | PlayerMoveFailedEvent
                        >(
                            createMovePlayerCommand,
                            (playerMoveCommand: MovePlayerCommand) =>
                                game.move(playerMoveCommand)
                        )
                    );

                    const movePlayerCommand = createMovePlayerCommand({
                        player: 2,
                        targetCell: {
                            row: 1,
                            column: 3
                        }
                    });
                    const playerMovedEvent = game.move(movePlayerCommand);
                    expect(toAsciiTable(game.getBoard()))
                        .toMatchInlineSnapshot(`
                          "
                          |---|---|---|---|
                          | 1 | 1 | 1 | 1 |
                          |---|---|---|---|
                          | 2 | 2 | 2 |   |
                          |---|---|---|---|"
                        `);

                    expect(playerMovedEvent).toEqual({
                        type: 'PLAYER_MOVE_FAILED',
                        payload: {
                            message:
                                'You cannot make a move, player 1 has already won the game'
                        }
                    });
                });
            });
            describe('as player two has won', () => {
                it('returns a move failed event', () => {
                    const game = new GameFactory({
                        boardDimensions: {
                            rows: 2,
                            columns: 6
                        }
                    });

                    const payloads = [
                        { player: 1, targetCell: { row: 0, column: 0 } },
                        { player: 2, targetCell: { row: 1, column: 0 } },
                        { player: 1, targetCell: { row: 0, column: 1 } },
                        { player: 2, targetCell: { row: 1, column: 1 } },
                        { player: 1, targetCell: { row: 0, column: 2 } },
                        { player: 2, targetCell: { row: 1, column: 2 } },
                        { player: 1, targetCell: { row: 0, column: 4 } },
                        { player: 2, targetCell: { row: 0, column: 3 } },
                        { player: 1, targetCell: { row: 1, column: 4 } },
                        { player: 2, targetCell: { row: 1, column: 3 } }
                    ] satisfies MovePlayerCommandPayload[];
                    payloads.forEach(
                        pipe<
                            [MovePlayerCommandPayload],
                            MovePlayerCommand,
                            PlayerMovedEvent | PlayerMoveFailedEvent
                        >(
                            createMovePlayerCommand,
                            (playerMoveCommand: MovePlayerCommand) =>
                                game.move(playerMoveCommand)
                        )
                    );

                    const movePlayerCommand = createMovePlayerCommand({
                        player: 1,
                        targetCell: {
                            row: 0,
                            column: 5
                        }
                    });
                    const playerMovedEvent = game.move(movePlayerCommand);
                    expect(toAsciiTable(game.getBoard()))
                        .toMatchInlineSnapshot(`
                          "
                          |---|---|---|---|---|--|
                          | 1 | 1 | 1 | 2 | 1 |  |
                          |---|---|---|---|---|--|
                          | 2 | 2 | 2 | 2 | 1 |  |
                          |---|---|---|---|---|--|"
                        `);

                    expect(playerMovedEvent).toEqual({
                        type: 'PLAYER_MOVE_FAILED',
                        payload: {
                            message:
                                'You cannot make a move, player 2 has already won the game'
                        }
                    });
                });
            });
            describe('as a game is tied', () => {
                it('returns a move failed event', () => {
                    const game = new GameFactory({
                        boardDimensions: { rows: 2, columns: 3 }
                    });

                    const payloads = [
                        { player: 1, targetCell: { row: 0, column: 0 } },
                        { player: 2, targetCell: { row: 1, column: 0 } },
                        { player: 1, targetCell: { row: 0, column: 1 } },
                        { player: 2, targetCell: { row: 1, column: 1 } },
                        { player: 1, targetCell: { row: 0, column: 2 } },
                        { player: 2, targetCell: { row: 1, column: 2 } }
                    ] satisfies MovePlayerCommandPayload[];

                    payloads.forEach(
                        pipe<
                            [MovePlayerCommandPayload],
                            MovePlayerCommand,
                            PlayerMovedEvent | PlayerMoveFailedEvent
                        >(
                            createMovePlayerCommand,
                            (playerMoveCommand: MovePlayerCommand) =>
                                game.move(playerMoveCommand)
                        )
                    );

                    const movePlayerCommand = createMovePlayerCommand({
                        player: 1,
                        targetCell: {
                            row: 0,
                            column: 0
                        }
                    });
                    const playerMovedEvent = game.move(movePlayerCommand);
                    expect(toAsciiTable(game.getBoard()))
                        .toMatchInlineSnapshot(`
                          "
                          |---|---|---|
                          | 1 | 1 | 1 |
                          |---|---|---|
                          | 2 | 2 | 2 |
                          |---|---|---|"
                        `);

                    expect(playerMovedEvent).toEqual({
                        type: 'PLAYER_MOVE_FAILED',
                        payload: {
                            message:
                                'You cannot make a move, the game has already ended in a draw'
                        }
                    });
                });
            });
        });
    });
    describe('getting the status of the game', () => {
        describe('given a new game', () => {
            it('reports the status as in progress', () => {
                const game = new GameFactory();
                const gameStatus = game.getStatus();
                expect(gameStatus).toBe('IN_PROGRESS');
            });
        });
        describe('and player one has won', () => {
            it('reports the status as player one won', () => {
                const game = new GameFactory({
                    boardDimensions: {
                        rows: 2,
                        columns: 4
                    }
                });

                const payloads = [
                    { player: 1, targetCell: { row: 0, column: 0 } },
                    { player: 2, targetCell: { row: 1, column: 0 } },
                    { player: 1, targetCell: { row: 0, column: 1 } },
                    { player: 2, targetCell: { row: 1, column: 1 } },
                    { player: 1, targetCell: { row: 0, column: 2 } },
                    { player: 2, targetCell: { row: 1, column: 2 } },
                    { player: 1, targetCell: { row: 0, column: 3 } }
                ] satisfies MovePlayerCommandPayload[];

                payloads.forEach(
                    pipe<
                        [MovePlayerCommandPayload],
                        MovePlayerCommand,
                        PlayerMovedEvent | PlayerMoveFailedEvent
                    >(
                        createMovePlayerCommand,
                        (playerMoveCommand: MovePlayerCommand) =>
                            game.move(playerMoveCommand)
                    )
                );

                expect(toAsciiTable(game.getBoard())).toMatchInlineSnapshot(`
                  "
                  |---|---|---|---|
                  | 1 | 1 | 1 | 1 |
                  |---|---|---|---|
                  | 2 | 2 | 2 |   |
                  |---|---|---|---|"
                `);
                expect(game.getStatus()).toBe('PLAYER_ONE_WIN');
            });
        });
        describe('and player two has won', () => {
            it('reports the status as player two won', () => {
                const game = new GameFactory({
                    boardDimensions: {
                        rows: 2,
                        columns: 5
                    }
                });

                const payloads = [
                    { player: 1, targetCell: { row: 0, column: 0 } },
                    { player: 2, targetCell: { row: 1, column: 0 } },
                    { player: 1, targetCell: { row: 0, column: 1 } },
                    { player: 2, targetCell: { row: 1, column: 1 } },
                    { player: 1, targetCell: { row: 0, column: 2 } },
                    { player: 2, targetCell: { row: 1, column: 2 } },
                    { player: 1, targetCell: { row: 0, column: 4 } },
                    { player: 2, targetCell: { row: 0, column: 3 } },
                    { player: 1, targetCell: { row: 1, column: 4 } },
                    { player: 2, targetCell: { row: 1, column: 3 } }
                ] satisfies MovePlayerCommandPayload[];

                payloads.forEach(
                    pipe<
                        [MovePlayerCommandPayload],
                        MovePlayerCommand,
                        PlayerMovedEvent | PlayerMoveFailedEvent
                    >(
                        createMovePlayerCommand,
                        (playerMoveCommand: MovePlayerCommand) =>
                            game.move(playerMoveCommand)
                    )
                );

                expect(toAsciiTable(game.getBoard())).toMatchInlineSnapshot(`
                  "
                  |---|---|---|---|---|
                  | 1 | 1 | 1 | 2 | 1 |
                  |---|---|---|---|---|
                  | 2 | 2 | 2 | 2 | 1 |
                  |---|---|---|---|---|"
                `);
                expect(game.getStatus()).toBe('PLAYER_TWO_WIN');
            });
        });
        describe('given the game has come to a draw', () => {
            it('reports the status as a draw', () => {
                const game = new GameFactory({
                    boardDimensions: {
                        rows: 2,
                        columns: 2
                    }
                });

                const payloads = [
                    { player: 1, targetCell: { row: 0, column: 0 } },
                    { player: 2, targetCell: { row: 1, column: 0 } },
                    { player: 1, targetCell: { row: 0, column: 1 } },
                    { player: 2, targetCell: { row: 1, column: 1 } }
                ] satisfies MovePlayerCommandPayload[];

                payloads.forEach(
                    pipe<
                        [MovePlayerCommandPayload],
                        MovePlayerCommand,
                        PlayerMovedEvent | PlayerMoveFailedEvent
                    >(
                        createMovePlayerCommand,
                        (playerMoveCommand: MovePlayerCommand) =>
                            game.move(playerMoveCommand)
                    )
                );

                expect(toAsciiTable(game.getBoard())).toMatchInlineSnapshot(`
                  "
                  |---|---|
                  | 1 | 1 |
                  |---|---|
                  | 2 | 2 |
                  |---|---|"
                `);
                expect(game.getStatus()).toBe('DRAW');
            });
        });
    });
    describe('persisting a game', () => {
        describe('given defaults', () => {
            it('saves and loads a game using an in-memory repository', async () => {
                const game = new GameFactory();
                const gameId = await game.save();
                await game.load(gameId);
                expect(toAsciiTable(game.getBoard())).toMatchInlineSnapshot(`
                  "
                  |--|--|--|--|--|--|--|
                  |  |  |  |  |  |  |  |
                  |--|--|--|--|--|--|--|
                  |  |  |  |  |  |  |  |
                  |--|--|--|--|--|--|--|
                  |  |  |  |  |  |  |  |
                  |--|--|--|--|--|--|--|
                  |  |  |  |  |  |  |  |
                  |--|--|--|--|--|--|--|
                  |  |  |  |  |  |  |  |
                  |--|--|--|--|--|--|--|
                  |  |  |  |  |  |  |  |
                  |--|--|--|--|--|--|--|"
                `);
                expect(game.getActivePlayer()).toBe(1);
                expect(game.getPlayerStats(1)).toMatchObject({
                    playerNumber: 1,
                    remainingDiscs: 21
                });
                expect(game.getPlayerStats(2)).toMatchObject({
                    playerNumber: 2,
                    remainingDiscs: 21
                });
                expect(game.getStatus()).toBe('IN_PROGRESS');
            });
            it('deletes a game', async () => {
                const game = new GameFactory();
                const gameId = await game.save();
                await game.delete(gameId);
                await expect(game.load(gameId)).rejects.toThrow(
                    'The provided game UUID is invalid.'
                );
            });
            it('throws an error when deleting a non-existent game', async () => {
                const game = new GameFactory();
                const gameId = uuidv4();
                await expect(game.delete(gameId)).rejects.toThrow(
                    'Game does not exist in the repository.'
                );
            });
        });
        describe('given a custom repository', () => {
            describe('containing a previously saved game', () => {
                it('loads the saved game after the game is reset', async () => {
                    const game = new GameFactory();
                    game.move(
                        createMovePlayerCommand({
                            player: 1,
                            targetCell: {
                                row: 0,
                                column: 0
                            }
                        })
                    );
                    game.move(
                        createMovePlayerCommand({
                            player: 2,
                            targetCell: {
                                row: 0,
                                column: 1
                            }
                        })
                    );
                    const gameId = await game.save();
                    game.reset();
                    await game.load(gameId);
                    expect(toAsciiTable(game.getBoard()))
                        .toMatchInlineSnapshot(`
                      "
                      |---|---|--|--|--|--|--|
                      | 1 | 2 |  |  |  |  |  |
                      |---|---|--|--|--|--|--|
                      |   |   |  |  |  |  |  |
                      |---|---|--|--|--|--|--|
                      |   |   |  |  |  |  |  |
                      |---|---|--|--|--|--|--|
                      |   |   |  |  |  |  |  |
                      |---|---|--|--|--|--|--|
                      |   |   |  |  |  |  |  |
                      |---|---|--|--|--|--|--|
                      |   |   |  |  |  |  |  |
                      |---|---|--|--|--|--|--|"
                    `);
                    expect(game.getPlayerStats(1)).toMatchObject({
                        playerNumber: 1,
                        remainingDiscs: 20
                    });
                    expect(game.getPlayerStats(2)).toMatchObject({
                        playerNumber: 2,
                        remainingDiscs: 20
                    });
                    expect(game.getStatus()).toBe('IN_PROGRESS');
                });
            });

            it('saves the game', async () => {
                const repository = new InMemoryRepository();
                const game = new GameFactory({
                    repository
                });
                const gameId = await game.save();

                const {
                    board,
                    activePlayer,
                    playerStats: players,
                    gameStatus: status
                } = (await repository.load(gameId)) as PersistedGame;

                expect(toAsciiTable(board)).toMatchInlineSnapshot(`
                  "
                  |--|--|--|--|--|--|--|
                  |  |  |  |  |  |  |  |
                  |--|--|--|--|--|--|--|
                  |  |  |  |  |  |  |  |
                  |--|--|--|--|--|--|--|
                  |  |  |  |  |  |  |  |
                  |--|--|--|--|--|--|--|
                  |  |  |  |  |  |  |  |
                  |--|--|--|--|--|--|--|
                  |  |  |  |  |  |  |  |
                  |--|--|--|--|--|--|--|
                  |  |  |  |  |  |  |  |
                  |--|--|--|--|--|--|--|"
                `);
                expect(activePlayer).toBe(1);
                expect(players).toMatchObject({
                    1: { playerNumber: 1, remainingDiscs: 21 },
                    2: { playerNumber: 2, remainingDiscs: 21 }
                });
                expect(status).toBe('IN_PROGRESS');
            });
            it('loads a game', async () => {
                const repository = new InMemoryRepository();
                const game = new GameFactory({ repository });
                const gameId = await game.save();
                await game.load(gameId);
                expect(toAsciiTable(game.getBoard())).toMatchInlineSnapshot(`
                  "
                  |--|--|--|--|--|--|--|
                  |  |  |  |  |  |  |  |
                  |--|--|--|--|--|--|--|
                  |  |  |  |  |  |  |  |
                  |--|--|--|--|--|--|--|
                  |  |  |  |  |  |  |  |
                  |--|--|--|--|--|--|--|
                  |  |  |  |  |  |  |  |
                  |--|--|--|--|--|--|--|
                  |  |  |  |  |  |  |  |
                  |--|--|--|--|--|--|--|
                  |  |  |  |  |  |  |  |
                  |--|--|--|--|--|--|--|"
                `);
                expect(game.getActivePlayer()).toBe(1);
                expect(game.getPlayerStats(1)).toMatchObject({
                    playerNumber: 1,
                    remainingDiscs: 21
                });
                expect(game.getPlayerStats(2)).toMatchObject({
                    playerNumber: 2,
                    remainingDiscs: 21
                });
                expect(game.getStatus()).toBe('IN_PROGRESS');
            });
            it('deletes a game', async () => {
                const repository = new InMemoryRepository();
                const game = new GameFactory({ repository });
                const gameId = await game.save();
                await game.delete(gameId);
                await expect(game.load(gameId)).rejects.toThrow(
                    'The provided game UUID is invalid.'
                );
            });
            it('throws an error when deleting a non-existent game', async () => {
                const repository = new InMemoryRepository();
                const game = new GameFactory({ repository });
                const gameId = uuidv4();
                await expect(game.delete(gameId)).rejects.toThrow(
                    'Game does not exist in the repository.'
                );
            });
            describe('and an invalid UUID', () => {
                it('throws an error', async () => {
                    const repository = new InMemoryRepository();
                    const game = new GameFactory({ repository });
                    const invalidGameId = uuidv4();
                    await expect(game.load(invalidGameId)).rejects.toThrow(
                        'The provided game UUID is invalid.'
                    );
                });
            });
            describe("and it's a mongo repository", () => {
                beforeAll(async () => {
                    if (mongoose.connection.readyState === 0) {
                        await mongoose.connect(
                            import.meta.env.VITE_MONGODB_URI!
                        );
                    }
                });

                afterAll(async () => {
                    await mongoose.connection.close();
                });

                it('saves the game', async () => {
                    const repository = new MongoGameRepository();
                    const game = new GameFactory({
                        repository: repository
                    });
                    game.move(
                        createMovePlayerCommand({
                            player: 1,
                            targetCell: {
                                row: 0,
                                column: 0
                            }
                        })
                    );

                    const gameId = await game.save();
                    const {
                        board,
                        activePlayer,
                        playerStats: players,
                        gameStatus: status
                    } = (await repository.load(gameId)) as PersistedGame;

                    expect(toAsciiTable(board)).toMatchInlineSnapshot(`
                      "
                      |---|--|--|--|--|--|--|
                      | 1 |  |  |  |  |  |  |
                      |---|--|--|--|--|--|--|
                      |   |  |  |  |  |  |  |
                      |---|--|--|--|--|--|--|
                      |   |  |  |  |  |  |  |
                      |---|--|--|--|--|--|--|
                      |   |  |  |  |  |  |  |
                      |---|--|--|--|--|--|--|
                      |   |  |  |  |  |  |  |
                      |---|--|--|--|--|--|--|
                      |   |  |  |  |  |  |  |
                      |---|--|--|--|--|--|--|"
                    `);
                    expect(activePlayer).toBe(2);
                    expect(players).toMatchObject({
                        1: { playerNumber: 1, remainingDiscs: 20 },
                        2: { playerNumber: 2, remainingDiscs: 21 }
                    });
                    expect(status).toBe('IN_PROGRESS');
                });
                it('loads a game', async () => {
                    const repository = new MongoGameRepository();
                    const game = new GameFactory({ repository });
                    game.move(
                        createMovePlayerCommand({
                            player: 1,
                            targetCell: {
                                row: 0,
                                column: 0
                            }
                        })
                    );

                    const gameId = await game.save();
                    await game.load(gameId);
                    expect(toAsciiTable(game.getBoard()))
                        .toMatchInlineSnapshot(`
                      "
                      |--|--|--|--|--|--|--|
                      |  |  |  |  |  |  |  |
                      |--|--|--|--|--|--|--|
                      |  |  |  |  |  |  |  |
                      |--|--|--|--|--|--|--|
                      |  |  |  |  |  |  |  |
                      |--|--|--|--|--|--|--|
                      |  |  |  |  |  |  |  |
                      |--|--|--|--|--|--|--|
                      |  |  |  |  |  |  |  |
                      |--|--|--|--|--|--|--|
                      |  |  |  |  |  |  |  |
                      |--|--|--|--|--|--|--|"
                    `);
                    expect(game.getActivePlayer()).toBe(2);
                    expect(game.getPlayerStats(1)).toMatchObject({
                        playerNumber: 1,
                        remainingDiscs: 20
                    });
                    expect(game.getPlayerStats(2)).toMatchObject({
                        playerNumber: 2,
                        remainingDiscs: 21
                    });
                    expect(game.getStatus()).toBe('IN_PROGRESS');
                });
                it('deletes a game', async () => {
                    const repository = new MongoGameRepository();
                    const game = new GameFactory({ repository });
                    const gameId = await game.save();
                    await game.delete(gameId);
                    await expect(game.load(gameId)).rejects.toThrow(
                        'The provided game UUID is invalid.'
                    );
                });
                it('throws an error when deleting a non-existent game', async () => {
                    const repository = new MongoGameRepository();
                    const game = new GameFactory({ repository });
                    const gameId = uuidv4();
                    await expect(game.delete(gameId)).rejects.toThrow(
                        'Game does not exist in the repository.'
                    );
                });
            });
        });
    });
    describe('resetting a game', () => {
        describe('given defaults', () => {
            it('resets game', () => {
                const game = new GameFactory();
                game.reset();
                expect(toAsciiTable(game.getBoard())).toMatchInlineSnapshot(`
                  "
                  |--|--|--|--|--|--|--|
                  |  |  |  |  |  |  |  |
                  |--|--|--|--|--|--|--|
                  |  |  |  |  |  |  |  |
                  |--|--|--|--|--|--|--|
                  |  |  |  |  |  |  |  |
                  |--|--|--|--|--|--|--|
                  |  |  |  |  |  |  |  |
                  |--|--|--|--|--|--|--|
                  |  |  |  |  |  |  |  |
                  |--|--|--|--|--|--|--|
                  |  |  |  |  |  |  |  |
                  |--|--|--|--|--|--|--|"
                `);
                expect(game.getActivePlayer()).toBe(1);
                expect(game.getPlayerStats(1)).toMatchObject({
                    playerNumber: 1,
                    remainingDiscs: 21
                });
                expect(game.getPlayerStats(2)).toMatchObject({
                    playerNumber: 2,
                    remainingDiscs: 21
                });
                expect(game.getStatus()).toBe('IN_PROGRESS');
            });
        });
        describe('while game in progress', () => {
            it('resets game', () => {
                const game = new GameFactory();
                game.move(
                    createMovePlayerCommand({
                        player: 1,
                        targetCell: {
                            row: 0,
                            column: 0
                        }
                    })
                );
                expect(toAsciiTable(game.getBoard())).toMatchInlineSnapshot(`
                  "
                  |---|--|--|--|--|--|--|
                  | 1 |  |  |  |  |  |  |
                  |---|--|--|--|--|--|--|
                  |   |  |  |  |  |  |  |
                  |---|--|--|--|--|--|--|
                  |   |  |  |  |  |  |  |
                  |---|--|--|--|--|--|--|
                  |   |  |  |  |  |  |  |
                  |---|--|--|--|--|--|--|
                  |   |  |  |  |  |  |  |
                  |---|--|--|--|--|--|--|
                  |   |  |  |  |  |  |  |
                  |---|--|--|--|--|--|--|"
                `);
                game.reset();
                expect(toAsciiTable(game.getBoard())).toMatchInlineSnapshot(`
                  "
                  |--|--|--|--|--|--|--|
                  |  |  |  |  |  |  |  |
                  |--|--|--|--|--|--|--|
                  |  |  |  |  |  |  |  |
                  |--|--|--|--|--|--|--|
                  |  |  |  |  |  |  |  |
                  |--|--|--|--|--|--|--|
                  |  |  |  |  |  |  |  |
                  |--|--|--|--|--|--|--|
                  |  |  |  |  |  |  |  |
                  |--|--|--|--|--|--|--|
                  |  |  |  |  |  |  |  |
                  |--|--|--|--|--|--|--|"
                `);
                expect(game.getActivePlayer()).toBe(1);
                expect(game.getPlayerStats(1)).toMatchObject({
                    playerNumber: 1,
                    remainingDiscs: 21
                });
                expect(game.getPlayerStats(2)).toMatchObject({
                    playerNumber: 2,
                    remainingDiscs: 21
                });
                expect(game.getStatus()).toBe('IN_PROGRESS');
            });
        });
    });
});
