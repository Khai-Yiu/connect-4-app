"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const get_is_winning_move_1 = __importDefault(require("@/game/get-is-winning-move"));
const parse_ascii_table_1 = __importDefault(require("@/utils/parse-ascii-table"));
describe('get-is-winning-move', () => {
    const customResolver = (value) => {
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
    describe('checking for a vertical win', () => {
        describe("given a board and the next player's move", () => {
            describe('and the player move results in a win', () => {
                it('detects the win', () => {
                    const table = `
|---|---|
| 1 | 2 |
|---|---|
| 1 | 2 |
|---|---|
| 1 | 2 |
|---|---|
|   |   |
|---|---|`;
                    const board = (0, parse_ascii_table_1.default)(table, customResolver);
                    const playerMove = {
                        player: 1,
                        targetCell: {
                            row: 3,
                            column: 0
                        }
                    };
                    expect((0, get_is_winning_move_1.default)(board, playerMove)).toEqual(expect.objectContaining({
                        isWin: true
                    }));
                });
            });
            describe('and there are less than 4 rows on the board', () => {
                it('does not result in a vertical win', () => {
                    const table = `
    |---|---|
    | 1 | 2 |
    |---|---|
    | 1 | 2 |
    |---|---|
    |   |   |
    |---|---|`;
                    const playerMove = {
                        player: 1,
                        targetCell: {
                            row: 2,
                            column: 0
                        }
                    };
                    const board = (0, parse_ascii_table_1.default)(table, customResolver);
                    expect((0, get_is_winning_move_1.default)(board, playerMove)).toEqual(expect.objectContaining({
                        isWin: false
                    }));
                });
            });
            describe('and the winning column does not touch the board', () => {
                describe('and the player move results in a vertical win', () => {
                    it('detects the win', () => {
                        const table = `
    |---|---|
    | 1 | 2 |
    |---|---|
    | 1 | 2 |
    |---|---|
    | 1 | 2 |
    |---|---|
    |   |   |
    |---|---|
    |   |   |
    |---|---|`;
                        const playerMove = {
                            player: 1,
                            targetCell: {
                                row: 3,
                                column: 0
                            }
                        };
                        const board = (0, parse_ascii_table_1.default)(table, customResolver);
                        expect((0, get_is_winning_move_1.default)(board, playerMove)).toEqual(expect.objectContaining({
                            isWin: true
                        }));
                    });
                });
            });
        });
    });
    describe('checking for a horizontal win', () => {
        describe("given a board and the next player's move", () => {
            describe("and there are 3 of the active player's tokens to the left of the target cell", () => {
                it('detects the win', () => {
                    const table = `
|---|---|---|---|
| 1 | 1 | 1 |   |
|---|---|---|---|
| 2 | 2 | 2 |   |
|---|---|---|---|`;
                    const playerMove = {
                        player: 1,
                        targetCell: {
                            row: 0,
                            column: 3
                        }
                    };
                    const board = (0, parse_ascii_table_1.default)(table, customResolver);
                    expect((0, get_is_winning_move_1.default)(board, playerMove)).toEqual(expect.objectContaining({
                        isWin: true
                    }));
                });
            });
            describe("and there are 3 of the active player's tokens to the right of the target cell", () => {
                it('detects the win', () => {
                    const table = `
|---|---|---|---|
|   | 1 | 1 | 1 |
|---|---|---|---|
|   | 2 | 2 | 2 |
|---|---|---|---|`;
                    const playerMove = {
                        player: 1,
                        targetCell: {
                            row: 0,
                            column: 0
                        }
                    };
                    const board = (0, parse_ascii_table_1.default)(table, customResolver);
                    expect((0, get_is_winning_move_1.default)(board, playerMove)).toEqual(expect.objectContaining({
                        isWin: true
                    }));
                });
            });
            describe("and there are 2 of the active player's tokens to the left and 1 to the right of the target cell", () => {
                it('detects the win', () => {
                    const table = `
|---|---|---|---|
| 1 |   | 1 | 1 |
|---|---|---|---|
| 2 |   | 2 | 2 |
|---|---|---|---|`;
                    const playerMove = {
                        player: 1,
                        targetCell: {
                            row: 0,
                            column: 1
                        }
                    };
                    const board = (0, parse_ascii_table_1.default)(table, customResolver);
                    expect((0, get_is_winning_move_1.default)(board, playerMove)).toEqual(expect.objectContaining({
                        isWin: true
                    }));
                });
            });
            describe("and there are 2 of the active player's tokens to the right and 1 to the left of the target cell", () => {
                it('detects the win', () => {
                    const table = `
|---|---|---|---|
| 1 | 1 |   | 1 |
|---|---|---|---|
| 2 | 2 |   | 2 |
|---|---|---|---|`;
                    const playerMove = {
                        player: 1,
                        targetCell: {
                            row: 0,
                            column: 2
                        }
                    };
                    const board = (0, parse_ascii_table_1.default)(table, customResolver);
                    expect((0, get_is_winning_move_1.default)(board, playerMove)).toEqual(expect.objectContaining({
                        isWin: true
                    }));
                });
            });
            describe('and there are less than 3 columns to the left of the target cell', () => {
                it('does not result in a horizontal win', () => {
                    const table = `
|---|---|---|
| 1 | 1 |   |
|---|---|---|
| 2 | 2 |   |
|---|---|---|`;
                    const playerMove = {
                        player: 1,
                        targetCell: {
                            row: 0,
                            column: 2
                        }
                    };
                    const board = (0, parse_ascii_table_1.default)(table, customResolver);
                    expect((0, get_is_winning_move_1.default)(board, playerMove)).toEqual(expect.objectContaining({
                        isWin: false
                    }));
                });
            });
            describe('and there are less than 3 columns to the right of the target cell', () => {
                it('does not result in a horizontal win', () => {
                    const table = `
|---|---|---|
|   | 1 | 1 |
|---|---|---|
|   | 2 | 2 |
|---|---|---|`;
                    const playerMove = {
                        player: 1,
                        targetCell: {
                            row: 0,
                            column: 1
                        }
                    };
                    const board = (0, parse_ascii_table_1.default)(table, customResolver);
                    expect((0, get_is_winning_move_1.default)(board, playerMove)).toEqual(expect.objectContaining({
                        isWin: false
                    }));
                });
            });
            describe('and the winning row does not touch the board', () => {
                describe('and the player move results in a horizontal win', () => {
                    it('detects the win', () => {
                        const table = `
|---|---|---|---|---|---|
|   | 1 | 1 | 1 |   |   |
|---|---|---|---|---|---|
|   | 2 | 2 | 2 |   |   |
|---|---|---|---|---|---|`;
                        const playerMove = {
                            player: 1,
                            targetCell: {
                                row: 0,
                                column: 4
                            }
                        };
                        const board = (0, parse_ascii_table_1.default)(table, customResolver);
                        expect((0, get_is_winning_move_1.default)(board, playerMove)).toEqual(expect.objectContaining({
                            isWin: true
                        }));
                    });
                });
            });
        });
    });
    describe('checking for a diagonal win', () => {
        describe('that is bottom-left to top-right', () => {
            describe("given a board and the next player's move", () => {
                describe("and there are 3 of the moving player's discs to the left of the target cell", () => {
                    it('detects the win', () => {
                        const table = `
|---|---|---|---|
| 1 |   |   |   |
|---|---|---|---|
|   | 1 |   |   |
|---|---|---|---|
|   |   | 1 |   |
|---|---|---|---|
|   |   |   |   |
|---|---|---|---|`;
                        const board = (0, parse_ascii_table_1.default)(table, customResolver);
                        const playerMove = {
                            player: 1,
                            targetCell: {
                                row: 3,
                                column: 3
                            }
                        };
                        expect((0, get_is_winning_move_1.default)(board, playerMove)).toEqual(expect.objectContaining({
                            isWin: true
                        }));
                    });
                });
                describe("and there are 3 of the moving player's discs to the right of the target cell", () => {
                    it('detects the win', () => {
                        const table = `
|---|---|---|---|
|   |   |   |   |
|---|---|---|---|
|   | 1 |   |   |
|---|---|---|---|
|   |   | 1 |   |
|---|---|---|---|
|   |   |   | 1 |
|---|---|---|---|`;
                        const board = (0, parse_ascii_table_1.default)(table, customResolver);
                        const playerMove = {
                            player: 1,
                            targetCell: {
                                row: 0,
                                column: 0
                            }
                        };
                        expect((0, get_is_winning_move_1.default)(board, playerMove)).toEqual(expect.objectContaining({
                            isWin: true
                        }));
                    });
                });
                describe("and there are 2 of the moving player's tokens to the left and 1 to the right of the target cell", () => {
                    it('detects the win', () => {
                        const table = `
|---|---|---|---|
| 1 |   |   |   |
|---|---|---|---|
|   | 1 |   |   |
|---|---|---|---|
|   |   |   |   |
|---|---|---|---|
|   |   |   | 1 |
|---|---|---|---|`;
                        const board = (0, parse_ascii_table_1.default)(table, customResolver);
                        const playerMove = {
                            player: 1,
                            targetCell: {
                                row: 2,
                                column: 2
                            }
                        };
                        expect((0, get_is_winning_move_1.default)(board, playerMove)).toEqual(expect.objectContaining({
                            isWin: true
                        }));
                    });
                });
                describe("and there are 2 of the moving player's tokens to the right and 1 to the left of the target cell", () => {
                    it('detects the win', () => {
                        const table = `
|---|---|---|---|
| 1 |   |   |   |
|---|---|---|---|
|   |   |   |   |
|---|---|---|---|
|   |   | 1 |   |
|---|---|---|---|
|   |   |   | 1 |
|---|---|---|---|`;
                        const board = (0, parse_ascii_table_1.default)(table, customResolver);
                        const playerMove = {
                            player: 1,
                            targetCell: {
                                row: 1,
                                column: 1
                            }
                        };
                        expect((0, get_is_winning_move_1.default)(board, playerMove)).toEqual(expect.objectContaining({
                            isWin: true
                        }));
                    });
                });
                describe('and the player move results in a diagonal win under the main diagonal', () => {
                    it('detects the win', () => {
                        const table = `
|---|---|---|---|---|
|   |   |   |   |   |
|---|---|---|---|---|
| 1 |   |   |   |   |
|---|---|---|---|---|
|   | 1 |   |   |   |
|---|---|---|---|---|
|   |   | 1 |   |   |
|---|---|---|---|---|
|   |   |   |   |   |
|---|---|---|---|---|`;
                        const board = (0, parse_ascii_table_1.default)(table, customResolver);
                        const playerMove = {
                            player: 1,
                            targetCell: {
                                row: 4,
                                column: 3
                            }
                        };
                        expect((0, get_is_winning_move_1.default)(board, playerMove)).toEqual(expect.objectContaining({
                            isWin: true
                        }));
                    });
                });
                describe('and the player move results in a diagonal win above the main diagonal', () => {
                    it('detects the win', () => {
                        const table = `
|---|---|---|---|---|
|   | 1 |   |   |   |
|---|---|---|---|---|
|   |   | 1 |   |   |
|---|---|---|---|---|
|   |   |   | 1 |   |
|---|---|---|---|---|
|   |   |   |   |   |
|---|---|---|---|---|
|   |   |   |   |   |
|---|---|---|---|---|`;
                        const board = (0, parse_ascii_table_1.default)(table, customResolver);
                        const playerMove = {
                            player: 1,
                            targetCell: {
                                row: 3,
                                column: 4
                            }
                        };
                        expect((0, get_is_winning_move_1.default)(board, playerMove)).toEqual(expect.objectContaining({
                            isWin: true
                        }));
                    });
                });
                describe('and the winning diagonal does not touch the edge of the board', () => {
                    describe('and the player move results in a diagonal win', () => {
                        it('detects the win', () => {
                            const table = `
|---|---|---|---|---|---|
|   |   |   |   |   |   |
|---|---|---|---|---|---|
|   | 1 |   |   |   |   |
|---|---|---|---|---|---|
|   |   | 1 |   |   |   |
|---|---|---|---|---|---|
|   |   |   | 1 |   |   |
|---|---|---|---|---|---|
|   |   |   |   |   |   |
|---|---|---|---|---|---|
|   |   |   |   |   |   |
|---|---|---|---|---|---|`;
                            const board = (0, parse_ascii_table_1.default)(table, customResolver);
                            const playerMove = {
                                player: 1,
                                targetCell: {
                                    row: 4,
                                    column: 4
                                }
                            };
                            expect((0, get_is_winning_move_1.default)(board, playerMove)).toEqual(expect.objectContaining({
                                isWin: true
                            }));
                        });
                    });
                });
                describe('and there are less than 3 rows and columns to the left of the target cell', () => {
                    it('does not result in a diagonal win', () => {
                        const table = `
|---|---|---|
| 1 |   |   |
|---|---|---|
|   | 1 |   |
|---|---|---|
|   |   |   |
|---|---|---|`;
                        const board = (0, parse_ascii_table_1.default)(table, customResolver);
                        const playerMove = {
                            player: 1,
                            targetCell: {
                                row: 2,
                                column: 2
                            }
                        };
                        expect((0, get_is_winning_move_1.default)(board, playerMove)).toEqual(expect.objectContaining({
                            isWin: false
                        }));
                    });
                });
                describe('and there are less than 3 rows and columns to the right of the target cell', () => {
                    it('does not result in a diagonal win', () => {
                        const table = `
|---|---|---|
|   |   |   |
|---|---|---|
|   | 1 |   |
|---|---|---|
|   |   | 1 |
|---|---|---|`;
                        const board = (0, parse_ascii_table_1.default)(table, customResolver);
                        const playerMove = {
                            player: 1,
                            targetCell: {
                                row: 0,
                                column: 0
                            }
                        };
                        expect((0, get_is_winning_move_1.default)(board, playerMove)).toEqual(expect.objectContaining({
                            isWin: false
                        }));
                    });
                });
            });
        });
        describe('that is top-left to bottom-right', () => {
            describe("given a board and the next player's move", () => {
                describe("and there are 3 of the moving player's discs to the left of the target cell", () => {
                    it('detects the win', () => {
                        const table = `
|---|---|---|---|
|   |   |   |   |
|---|---|---|---|
|   |   | 1 |   |
|---|---|---|---|
|   | 1 |   |   |
|---|---|---|---|
| 1 |   |   |   |
|---|---|---|---|`;
                        const board = (0, parse_ascii_table_1.default)(table, customResolver);
                        const playerMove = {
                            player: 1,
                            targetCell: {
                                row: 0,
                                column: 3
                            }
                        };
                        expect((0, get_is_winning_move_1.default)(board, playerMove)).toEqual(expect.objectContaining({
                            isWin: true
                        }));
                    });
                });
                describe("and there are 3 of the moving player's discs to the right of the target cell", () => {
                    it('detects the win', () => {
                        const table = `
|---|---|---|---|
|   |   |   | 1 |
|---|---|---|---|
|   |   | 1 |   |
|---|---|---|---|
|   | 1 |   |   |
|---|---|---|---|
|   |   |   |   |
|---|---|---|---|`;
                        const board = (0, parse_ascii_table_1.default)(table, customResolver);
                        const playerMove = {
                            player: 1,
                            targetCell: {
                                row: 3,
                                column: 0
                            }
                        };
                        expect((0, get_is_winning_move_1.default)(board, playerMove)).toEqual(expect.objectContaining({
                            isWin: true
                        }));
                    });
                });
                describe("and there are 2 of the moving player's tokens to the left and 1 to the right of the target cell", () => {
                    it('detects the win', () => {
                        const table = `
|---|---|---|---|
|   |   |   | 1 |
|---|---|---|---|
|   |   |   |   |
|---|---|---|---|
|   | 1 |   |   |
|---|---|---|---|
| 1 |   |   |   |
|---|---|---|---|`;
                        const board = (0, parse_ascii_table_1.default)(table, customResolver);
                        const playerMove = {
                            player: 1,
                            targetCell: {
                                row: 1,
                                column: 2
                            }
                        };
                        expect((0, get_is_winning_move_1.default)(board, playerMove)).toEqual(expect.objectContaining({
                            isWin: true
                        }));
                    });
                });
                describe("and there are 2 of the moving player's tokens to the right and 1 to the left of the target cell", () => {
                    it('detects the win', () => {
                        const table = `
|---|---|---|---|
|   |   |   | 1 |
|---|---|---|---|
|   |   | 1 |   |
|---|---|---|---|
|   |   |   |   |
|---|---|---|---|
| 1 |   |   |   |
|---|---|---|---|`;
                        const board = (0, parse_ascii_table_1.default)(table, customResolver);
                        const playerMove = {
                            player: 1,
                            targetCell: {
                                row: 2,
                                column: 1
                            }
                        };
                        expect((0, get_is_winning_move_1.default)(board, playerMove)).toEqual(expect.objectContaining({
                            isWin: true
                        }));
                    });
                });
                describe('and the player move results in a diagonal win under the main diagonal', () => {
                    it('detects the win', () => {
                        const table = `
|---|---|---|---|---|
|   |   |   |   |   |
|---|---|---|---|---|
|   |   |   |   |   |
|---|---|---|---|---|
|   |   |   | 1 |   |
|---|---|---|---|---|
|   |   | 1 |   |   |
|---|---|---|---|---|
|   | 1 |   |   |   |
|---|---|---|---|---|`;
                        const board = (0, parse_ascii_table_1.default)(table, customResolver);
                        const playerMove = {
                            player: 1,
                            targetCell: {
                                row: 1,
                                column: 4
                            }
                        };
                        expect((0, get_is_winning_move_1.default)(board, playerMove)).toEqual(expect.objectContaining({
                            isWin: true
                        }));
                    });
                });
                describe('and the player move results in a diagonal win above the main diagonal', () => {
                    it('detects the win', () => {
                        const table = `
|---|---|---|---|---|
|   |   |   |   |   |
|---|---|---|---|---|
|   |   | 1 |   |   |
|---|---|---|---|---|
|   | 1 |   |   |   |
|---|---|---|---|---|
| 1 |   |   |   |   |
|---|---|---|---|---|
|   |   |   |   |   |
|---|---|---|---|---|`;
                        const board = (0, parse_ascii_table_1.default)(table, customResolver);
                        const playerMove = {
                            player: 1,
                            targetCell: {
                                row: 0,
                                column: 3
                            }
                        };
                        expect((0, get_is_winning_move_1.default)(board, playerMove)).toEqual(expect.objectContaining({
                            isWin: true
                        }));
                    });
                });
                describe('and the winning diagonal does not touch the board', () => {
                    it('detects the win', () => {
                        const table = `
|---|---|---|---|---|---|
|   |   |   |   |   |   |
|---|---|---|---|---|---|
|   |   |   |   |   |   |
|---|---|---|---|---|---|
|   |   |   | 1 |   |   |
|---|---|---|---|---|---|
|   |   | 1 |   |   |   |
|---|---|---|---|---|---|
|   | 1 |   |   |   |   |
|---|---|---|---|---|---|
|   |   |   |   |   |   |
|---|---|---|---|---|---|`;
                        const board = (0, parse_ascii_table_1.default)(table, customResolver);
                        const playerMove = {
                            player: 1,
                            targetCell: {
                                row: 1,
                                column: 4
                            }
                        };
                        expect((0, get_is_winning_move_1.default)(board, playerMove)).toEqual(expect.objectContaining({
                            isWin: true
                        }));
                    });
                });
                describe('and there are less than 3 rows and columns to the left of the target cell', () => {
                    it('does not result in a diagonal win', () => {
                        const table = `
|---|---|---|
|   |   |   |
|---|---|---|
|   | 1 |   |
|---|---|---|
| 1 |   |   |
|---|---|---|`;
                        const board = (0, parse_ascii_table_1.default)(table, customResolver);
                        const playerMove = {
                            player: 1,
                            targetCell: {
                                row: 0,
                                column: 2
                            }
                        };
                        expect((0, get_is_winning_move_1.default)(board, playerMove)).toEqual(expect.objectContaining({
                            isWin: false
                        }));
                    });
                });
                describe('and there are less than 3 rows and columns to the right of the target cell', () => {
                    it('does not result in a diagonal win', () => {
                        const table = `
|---|---|---|
|   |   | 1 |
|---|---|---|
|   | 1 |   |
|---|---|---|
|   |   |   |
|---|---|---|`;
                        const board = (0, parse_ascii_table_1.default)(table, customResolver);
                        const playerMove = {
                            player: 1,
                            targetCell: {
                                row: 2,
                                column: 0
                            }
                        };
                        expect((0, get_is_winning_move_1.default)(board, playerMove)).toEqual(expect.objectContaining({
                            isWin: false
                        }));
                    });
                });
            });
        });
    });
});
