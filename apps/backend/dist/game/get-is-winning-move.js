"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isConsecutiveWin(cellArray, player) {
    const { isWinning } = cellArray.reduce((state, currentCell) => {
        const { consecutiveDiscs, isWinning } = state;
        return currentCell.player === player
            ? {
                consecutiveDiscs: consecutiveDiscs + 1,
                isWinning: consecutiveDiscs + 1 >= 4
            }
            : { consecutiveDiscs: 0, isWinning };
    }, { consecutiveDiscs: 0, isWinning: false });
    return isWinning;
}
function isDirectionalDiagonalWin(board, playerMove, diagonalMovement) {
    const { player, targetCell: { row, column } } = playerMove;
    let { startRow, startColumn, direction: { rowIncrement, columnIncrement } } = diagonalMovement;
    const diagonalToCheck = [];
    while (startRow < board.length &&
        startColumn < board[0].length &&
        startRow >= 0 &&
        startColumn >= 0) {
        if (startRow === row && startColumn === column) {
            diagonalToCheck.push({ player: player });
        }
        else {
            diagonalToCheck.push(board[startRow][startColumn]);
        }
        startRow += rowIncrement;
        startColumn += columnIncrement;
    }
    return isConsecutiveWin(diagonalToCheck, player);
}
function isDiagonalWin(board, playerMove) {
    if (board.length < 4 || board[0].length < 4) {
        return false;
    }
    const { targetCell: { row, column } } = playerMove;
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
    return (isDirectionalDiagonalWin(board, playerMove, bottomLeftToTopRight) ||
        isDirectionalDiagonalWin(board, playerMove, topLeftToBottomRight));
}
function isVerticalWin(board, playerMove) {
    if (board.length < 4) {
        return false;
    }
    const { player, targetCell: { row, column } } = playerMove;
    const columnToCheck = board.map((row) => row[column]);
    columnToCheck[row] = { player: player };
    return isConsecutiveWin(columnToCheck, player);
}
function isHorizontalWin(board, playerMove) {
    if (board[0].length < 4) {
        return false;
    }
    const { player, targetCell: { row, column } } = playerMove;
    const rowToCheck = [...board[row]];
    rowToCheck[column] = { player: player };
    return isConsecutiveWin(rowToCheck, player);
}
function getIsWinningMove(board, playerMove) {
    const isWin = isVerticalWin(board, playerMove) ||
        isHorizontalWin(board, playerMove) ||
        isDiagonalWin(board, playerMove);
    return {
        isWin
    };
}
exports.default = getIsWinningMove;
