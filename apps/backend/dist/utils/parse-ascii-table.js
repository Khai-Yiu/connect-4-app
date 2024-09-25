function defaultCustomResolver(value) {
    return value.length === 0 ? undefined : value;
}
function parseAsciiTable(asciiTable, customResolver = defaultCustomResolver) {
    if (asciiTable.length === 0) {
        return [];
    }
    const asciiTableRows = asciiTable.split('\n').slice(1);
    const grid = asciiTableRows.reduce((grid, row, currentIndex) => {
        if (currentIndex % 2 == 0) {
            return grid;
        }
        const rowCells = row.split('|');
        const rowCellsWithoutStartAndEnd = rowCells.slice(1, rowCells.length - 1);
        const gridRow = rowCellsWithoutStartAndEnd.reduce((row, currentCell) => {
            const trimmedValue = currentCell.slice(1).trimEnd();
            row.push(customResolver(trimmedValue));
            return [...row];
        }, []);
        grid.push(gridRow);
        return [...grid];
    }, []);
    return grid;
}
export default parseAsciiTable;
