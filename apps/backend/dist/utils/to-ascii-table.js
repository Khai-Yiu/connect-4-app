"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createBorder(largestCharacterWidthPerColumn) {
    return largestCharacterWidthPerColumn.reduce((border, currentWidth) => border + `${'-'.repeat(currentWidth + 2)}|`, '|');
}
const defaultResolver = (value) => value === null || value === undefined ? '' : `${value}`;
function getLargestCharacterWidthPerColumn(grid, cellResolver) {
    return grid.reduce((maxColumnWidths, currentRow) => {
        currentRow.forEach((currentElement, columnIndex) => {
            const resolvedElement = cellResolver(currentElement);
            if (resolvedElement.length > maxColumnWidths[columnIndex]) {
                maxColumnWidths[columnIndex] = resolvedElement.length;
            }
        });
        return [...maxColumnWidths];
    }, Array(grid[0].length).fill(0));
}
function getPaddedContent(value, widthOfLargestCellContentInColumn) {
    return ` ${value.padEnd(widthOfLargestCellContentInColumn, ' ')} `;
}
function validateGridDimensions(grid) {
    const knownRowLength = grid[0].length;
    grid.forEach((row) => {
        if (row.length !== knownRowLength) {
            throw new Error('The number of columns within each row is not equal');
        }
    });
}
function toAsciiTable(grid, cellResolver = defaultResolver) {
    if (grid.length === 0) {
        return '';
    }
    validateGridDimensions(grid);
    const largestCharacterWidthPerColumn = getLargestCharacterWidthPerColumn(grid, cellResolver);
    const tableRows = grid.reduce((tableRows, currentRow) => {
        tableRows.push(currentRow.reduce((rowContent, currentElement, currentIndex) => {
            const paddedContent = getPaddedContent(cellResolver(currentElement), largestCharacterWidthPerColumn[currentIndex]);
            return rowContent.concat(`${paddedContent}|`);
        }, '|'));
        return tableRows;
    }, []);
    const border = createBorder(largestCharacterWidthPerColumn);
    return ['', border, tableRows.join('\n' + border + '\n'), border].join('\n');
}
exports.default = toAsciiTable;
