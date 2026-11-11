export const cellFromRange = (element: HTMLElement, range: Range | null): HTMLTableCellElement | null => {
    const node = range?.commonAncestorContainer
    const parent = node?.nodeType === Node.ELEMENT_NODE ? node as HTMLElement : node?.parentElement
    const cell = parent?.closest("th, td") as HTMLTableCellElement | null

    return cell && element.contains(cell) ? cell : null
}
