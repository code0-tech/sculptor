import {ListEntry} from "@edition/datatype/components/inputs/list/DataTypeListInput.util";

const LITERAL_TOKEN = /^\$\{literal_(\d+)}$/

export const literalTokens = (entries: ListEntry[], previous: string[]): string[] => {
    const start = previous.reduce((highest, token) =>
        Math.max(highest, Number(token.match(LITERAL_TOKEN)?.[1] ?? -1)), -1) + 1

    return entries.map((entry, index) => {
        if (typeof entry !== "string") return String(entry ?? "")
        if (/^\$\{.+}$/.test(entry)) return entry

        const kept = previous[index]

        return kept && LITERAL_TOKEN.test(kept) ? kept : `\${literal_${start + index}}`
    })
}
