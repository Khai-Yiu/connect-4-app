import { describe, it, expect } from 'vitest';
import createCells from '@/connect-4-ui/create-cells';

describe('create-cells', () => {
    it('returns a 0x0 board given defaults', () => {
        expect(createCells()).toEqual([]);
    });
    describe('given the number of rows and columns', () => {
        it('returns a row x column board given the number of rows and columns', () => {
            const board = createCells(2, 3);

            expect(board.length).toEqual(2);
            expect(board[0].length).toEqual(3);
        });
        it('returns a board filled with objects conforming to BoardCellProps type', () => {
            expect(createCells(2, 2)).toEqual([
                [
                    expect.objectContaining({
                        player: undefined,
                        uuid: expect.toBeUuid()
                    }),
                    expect.objectContaining({
                        player: undefined,
                        uuid: expect.toBeUuid()
                    })
                ],
                [
                    expect.objectContaining({
                        player: undefined,
                        uuid: expect.toBeUuid()
                    }),
                    expect.objectContaining({
                        player: undefined,
                        uuid: expect.toBeUuid()
                    })
                ]
            ]);
        });
        describe('and a player selection strategy', () => {
            describe('that always selects player 1', () => {
                it('creates a single cell occupied by player 1', () => {
                    const playerOneStrategy = (): 1 | 2 | undefined => 1;
                    expect(createCells(1, 1, playerOneStrategy)).toEqual([
                        [
                            expect.objectContaining({
                                player: 1,
                                uuid: expect.toBeUuid()
                            })
                        ]
                    ]);
                });
            });
        });
    });
});
