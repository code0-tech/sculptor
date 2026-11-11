export type TableCommand =
    | "row-above"
    | "row-below"
    | "column-left"
    | "column-right"
    | "delete-row"
    | "delete-column"
    | "delete-table"

const tableCell = (tag: string): HTMLTableCellElement => {
    const cell = document.createElement(tag === "TH" ? "th" : "td")
    cell.appendChild(document.createElement("br"))
    return cell as HTMLTableCellElement
}

const tableRow = (columns: number): HTMLTableRowElement => {
    const row = document.createElement("tr")
    Array.from({length: columns}).forEach(() => row.appendChild(tableCell("TD")))
    return row as HTMLTableRowElement
}

const insertRow = (row: HTMLTableRowElement, body: HTMLTableSectionElement | null, above: boolean): HTMLTableRowElement => {
    const created = tableRow(row.children.length)

    if (row.parentElement?.tagName === "THEAD" && body) body.insertBefore(created, body.firstChild)
    else row.parentElement?.insertBefore(created, above ? row : row.nextSibling)

    return created
}

const removeRow = (table: HTMLTableElement, row: HTMLTableRowElement, index: number): HTMLElement | null => {
    const sibling = row.nextElementSibling ?? row.previousElementSibling

    row.remove()

    if (table.rows.length === 0) {
        table.remove()
        return null
    }

    return (sibling?.children[index] ?? sibling?.children[0] ?? null) as HTMLElement | null
}

const insertColumn = (rows: HTMLTableRowElement[], row: HTMLTableRowElement, index: number, at: number): HTMLElement | null => {
    rows.forEach(current => current.insertBefore(
        tableCell((current.children[index] ?? current.children[0])?.tagName ?? "TD"),
        current.children[at] ?? null
    ))

    return (row.children[at] ?? null) as HTMLElement | null
}

const removeColumn = (table: HTMLTableElement, rows: HTMLTableRowElement[], row: HTMLTableRowElement, index: number): HTMLElement | null => {
    rows.forEach(current => current.children[index]?.remove())

    if ((table.rows[0]?.children.length ?? 0) === 0) {
        table.remove()
        return null
    }

    return (row.children[Math.min(index, row.children.length - 1)] ?? null) as HTMLElement | null
}

export const applyTableCommand = (cell: HTMLTableCellElement, command: TableCommand): HTMLElement | null => {
    const table = cell.closest("table")
    const row = cell.closest("tr")

    if (!table || !row) return null

    const index = cell.cellIndex
    const rows = Array.from(table.rows)

    if (command === "delete-table") {
        table.remove()
        return null
    }

    if (command === "row-above" || command === "row-below") {
        const created = insertRow(row, table.querySelector("tbody"), command === "row-above")
        return (created.children[index] ?? created.children[0]) as HTMLElement | null
    }

    if (command === "delete-row") return removeRow(table, row, index)

    if (command === "column-left" || command === "column-right") {
        return insertColumn(rows, row, index, command === "column-left" ? index : index + 1)
    }

    return removeColumn(table, rows, row, index)
}
