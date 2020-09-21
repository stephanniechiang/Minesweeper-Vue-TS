export default interface Cell {
    row: number;
    col: number;
    mine: boolean;
    exploded: boolean;
    flagged: boolean;
    hidden: boolean;
    adjacentCells: number;
}
