import { Board, BoardCell, PlayerMove } from '@/connect-4-domain/game-types';

type WinState = {
    consecutiveDiscs: number;
    isWinning: boolean;
};

type DiagonalMovement = {
    startRow: number;
    startColumn: number;
    direction: {
        rowIncrement: number;
        columnIncrement: number;
    };
};

function isConsecutiveWin(
    cellArray: Array<BoardCell>,
    player: 1 | 2 | undefined
): boolean {
    const { isWinning } = cellArray.reduce(
        (state: WinState, currentCell: BoardCell): WinState => {
            const { consecutiveDiscs, isWinning } = state;

            return currentCell.player === player
                ? {
                      consecutiveDiscs: consecutiveDiscs + 1,
                      isWinning: consecutiveDiscs + 1 >= 4
                  }
                : { consecutiveDiscs: 0, isWinning };
        },
        { consecutiveDiscs: 0, isWinning: false }
    );

    return isWinning;
}

function isDirectionalDiagonalWin(
    board: Board,
    playerMove: PlayerMove,
    diagonalMovement: DiagonalMovement
): boolean {
    const {
        player,
        targetCell: { row, column }
    } = playerMove;
    let {
        startRow,
        startColumn,
        direction: { rowIncrement, columnIncrement }
    } = diagonalMovement;

    const diagonalToCheck = [];
    while (
        startRow < board.length &&
        startColumn < board[0].length &&
        startRow >= 0 &&
        startColumn >= 0
    ) {
        if (startRow === row && startColumn === column) {
            diagonalToCheck.push({ player: player });
        } else {
            diagonalToCheck.push(board[startRow][startColumn]);
        }

        startRow += rowIncrement;
        startColumn += columnIncrement;
    }

    return isConsecutiveWin(diagonalToCheck, player);
}

function isDiagonalWin(board: Board, playerMove: PlayerMove): boolean {
    if (board.length < 4 || board[0].length < 4) {
        return false;
    }

    const {
        targetCell: { row, column }
    } = playerMove;

    const bottomLeftToTopRight = {
        startRow: row - Math.min(row, column),
        startColumn: column - Math.min(row, column),
        direction: {
            rowIncrement: 1,
            columnIncrement: 1
        }
    };

    const topLeftToBottomRight = {
        startRow: row + Math.min(board.length - 1 - row, column),
        startColumn: column - Math.min(board.length - 1 - row, column),
        direction: {
            rowIncrement: -1,
            columnIncrement: 1
        }
    };

    return (
        isDirectionalDiagonalWin(board, playerMove, bottomLeftToTopRight) ||
        isDirectionalDiagonalWin(board, playerMove, topLeftToBottomRight)
    );
}

function isVerticalWin(board: Board, playerMove: PlayerMove): boolean {
    if (board.length < 4) {
        return false;
    }

    const {
        player,
        targetCell: { row, column }
    } = playerMove;
    const columnToCheck = board.map(
        (row: Array<BoardCell>): BoardCell => row[column]
    );
    columnToCheck[row] = { player: player };

    return isConsecutiveWin(columnToCheck, player);
}

function isHorizontalWin(board: Board, playerMove: PlayerMove): boolean {
    if (board[0].length < 4) {
        return false;
    }

    const {
        player,
        targetCell: { row, column }
    } = playerMove;
    const rowToCheck = [...board[row]];
    rowToCheck[column] = { player: player };

    return isConsecutiveWin(rowToCheck, player);
}

function getIsWinningMove(
    board: Board,
    playerMove: PlayerMove
): {
    isWin: boolean;
} {
    const isWin =
        isVerticalWin(board, playerMove) ||
        isHorizontalWin(board, playerMove) ||
        isDiagonalWin(board, playerMove);

    return {
        isWin
    };
}

export default getIsWinningMove;
