const INLINE_TAGS = new Set(["SPAN", "FONT", "LABEL", "SMALL", "SUB", "SUP", "U", "INS", "MARK"])

const BLOCK_TAGS = new Set(["P", "DIV", "LI", "TD", "TH", "BLOCKQUOTE", "H1", "H2", "H3", "H4", "H5", "H6"])

const inlineText = (text: string): string => text.replace(/\s+/g, " ")

const escapeInline = (text: string): string => text
    .replace(/\\/g, "\\\\")
    .replace(/([`*\[\]])/g, "\\$1")
    .replace(/~~/g, "\\~\\~")
    .replace(/_+/g, (match, offset: number, full: string) => {
        const before = full[offset - 1] ?? ""
        const after = full[offset + match.length] ?? ""
        return /[A-Za-z0-9]/.test(before) && /[A-Za-z0-9]/.test(after)
            ? match
            : match.split("").map(char => `\\${char}`).join("")
    })

const escapeBlockStart = (text: string): string => text
    .replace(/^(\s{0,3})([#>+-])/, "$1\\$2")
    .replace(/^(\s{0,3})(\d+)\./, "$1$2\\.")
    .replace(/^(\s{0,3})\|/, "$1\\|")
    .replace(/^(\s{0,3})(={2,})\s*$/, "$1\\$2")

const codeSpan = (content: string): string => {
    const longest = (content.match(/`+/g) ?? []).reduce((length, run) => Math.max(length, run.length), 0)
    const fence = "`".repeat(longest + 1)
    const padding = content.startsWith("`") || content.endsWith("`") ? " " : ""

    return `${fence}${padding}${content}${padding}${fence}`
}

const linkTitle = (element: HTMLElement): string => {
    const title = element.getAttribute("title")
    return title ? ` "${title.replace(/"/g, "\\\"")}"` : ""
}

const childrenToMarkdown = (element: HTMLElement): string =>
    Array.from(element.childNodes).map(node => nodeToMarkdown(node)).join("")

const listItemMarker = (item: Element, ordered: boolean, position: number): string => {
    const checkbox = item.querySelector("input[type=checkbox]") as HTMLInputElement | null

    if (ordered) return `${position}. `
    if (!checkbox) return "- "

    return `- [${checkbox.checked ?? checkbox.hasAttribute("checked") ? "x" : " "}] `
}

const listToMarkdown = (element: HTMLElement, ordered: boolean): string => {
    const items = Array.from(element.children).filter(child => child.tagName === "LI")
    const start = Number(element.getAttribute("start")) || 1

    return `\n${items.map((item, index) => {
        const marker = listItemMarker(item, ordered, start + index)
        const [first, ...rest] = childrenToMarkdown(item as HTMLElement).trim().split("\n")

        return [`${marker}${first ?? ""}`, ...rest.map(line => line.length > 0 ? `  ${line}` : line)].join("\n")
    }).join("\n")}\n\n`
}

const cellAlignment = (cell: Element): string => {
    const align = (cell as HTMLElement).style?.textAlign || cell.getAttribute("align") || ""

    if (align === "left") return ":---"
    if (align === "right") return "---:"
    if (align === "center") return ":---:"
    return "---"
}

const tableRowToMarkdown = (values: string[]): string => `| ${values.join(" | ")} |`

const tableToMarkdown = (element: HTMLElement): string => {
    const rows = Array.from(element.querySelectorAll("tr"))
    const cells = rows.map(row => Array.from(row.children)
        .map(cell => childrenToMarkdown(cell as HTMLElement).trim().replace(/\|/g, "\\|")))
    const [header, ...body] = cells

    if (!header) return ""

    const alignments = Array.from(rows[0]?.children ?? []).map(cellAlignment)

    return `\n${[header, alignments, ...body].map(tableRowToMarkdown).join("\n")}\n\n`
}

const textNodeToMarkdown = (node: Node): string => {
    const text = inlineText(node.textContent ?? "")
    const parent = node.parentElement

    if (parent?.closest("code") || parent?.closest("pre")) return text

    const escaped = escapeInline(text)

    return parent && BLOCK_TAGS.has(parent.tagName) && node === parent.firstChild
        ? escapeBlockStart(escaped)
        : escaped
}

const codeBlockToMarkdown = (element: HTMLElement): string => {
    const language = (element.querySelector("code")?.className ?? "")
        .match(/language-([\w+#.-]+)/)?.[1] ?? ""

    return `\n\`\`\`${language}\n${(element.textContent ?? "").replace(/\n+$/, "")}\n\`\`\`\n\n`
}

const elementToMarkdown = (element: HTMLElement, node: Node, children: string): string => {
    switch (element.tagName) {
        case "BR":
            return node === node.parentElement?.lastChild ? "" : "\\\n"
        case "STRONG":
        case "B":
            return children.trim().length > 0 ? `**${children.trim()}**` : ""
        case "EM":
        case "I":
            return children.trim().length > 0 ? `_${children.trim()}_` : ""
        case "DEL":
        case "S":
        case "STRIKE":
            return children.trim().length > 0 ? `~~${children.trim()}~~` : ""
        case "CODE":
            return element.closest("pre") ? children : codeSpan(children.trim())
        case "PRE":
            return codeBlockToMarkdown(element)
        case "A":
            return `[${children.trim()}](${element.getAttribute("href") ?? ""}${linkTitle(element)})`
        case "IMG":
            return `![${element.getAttribute("alt") ?? ""}](${element.getAttribute("src") ?? ""}${linkTitle(element)})`
        case "HR":
            return "\n---\n\n"
        case "INPUT":
            return ""
        case "BLOCKQUOTE":
            return `\n${children.trim().replace(/\n{3,}/g, "\n\n").split("\n")
                .map(line => `> ${line}`.trimEnd()).join("\n")}\n\n`
        case "UL":
            return listToMarkdown(element, false)
        case "OL":
            return listToMarkdown(element, true)
        case "TABLE":
            return tableToMarkdown(element)
        case "P":
        case "DIV":
        case "SECTION":
        case "ARTICLE":
            return `\n${children.trim()}\n\n`
        default:
            return children
    }
}

const nodeToMarkdown = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return textNodeToMarkdown(node)
    if (node.nodeType !== Node.ELEMENT_NODE) return ""

    const element = node as HTMLElement
    const signature = element.dataset?.reference

    if (signature) return `\${${signature}}`

    const children = childrenToMarkdown(element)
    const heading = element.tagName.match(/^H([1-6])$/)

    if (heading) return `\n${"#".repeat(Number(heading[1]))} ${children.trim()}\n\n`
    if (INLINE_TAGS.has(element.tagName)) return children

    return elementToMarkdown(element, node, children)
}

export const markdownFromElement = (element: HTMLElement): string =>
    childrenToMarkdown(element)
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\\\n[ \t]+/g, "\\\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
