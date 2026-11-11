export type CellContext = "none" | "cell" | "header"

export const cellContext = (cell: HTMLTableCellElement | null): CellContext => {
    if (!cell) return "none"
    if (cell.tagName === "TH") return "header"
    return "cell"
}
