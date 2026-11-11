import React from "react";
import {useDebouncedCallback} from "use-debounce";
import {InlineReferenceValue, ReferenceValue, SubFlowValue} from "@code0-tech/sagittarius-graphql-types";
import {markdownFromElement} from "@edition/datatype/utils/DataTypeMarkdown.toMarkdown.util";
import {
    ReferenceHost,
    referenceHosts
} from "@edition/datatype/utils/DataTypeMarkdown.referenceHosts.util";
import {
    mountReferenceHosts
} from "@edition/datatype/utils/DataTypeMarkdown.mountReferenceHosts.util";
import {cellFromRange} from "@edition/datatype/utils/DataTypeMarkdown.cellFromRange.util";
import {
    CellContext,
    cellContext
} from "@edition/datatype/utils/DataTypeMarkdown.cellContext.util";
import {
    applyTableCommand,
    TableCommand
} from "@edition/datatype/utils/DataTypeMarkdown.applyTableCommand.util";

export interface CaretAnchor {
    top: number
    left: number
}

export interface MarkdownDocumentOptions {
    value: string
    references?: InlineReferenceValue[] | null
    referenceable: boolean
    onChange: (value: string, references: InlineReferenceValue[]) => void
}

export interface MarkdownDocument {
    editor: React.RefObject<HTMLDivElement | null>
    referenced: React.RefObject<Map<string, ReferenceValue | SubFlowValue>>
    seed: string
    hosts: ReferenceHost[]
    context: CellContext
    anchor: CaretAnchor | null
    query: string
    input: () => void
    commit: () => void
    flush: () => void
    commitNow: () => void
    focus: () => void
    openAnchor: () => void
    closeAnchor: () => void
    selectQuery: () => void
    runTableCommand: (command: TableCommand) => void
    clear: () => void
}

export const useMarkdownDocument = (options: MarkdownDocumentOptions): MarkdownDocument => {

    const {value, references, referenceable, onChange} = options

    const editor = React.useRef<HTMLDivElement>(null)
    const committed = React.useRef(value)
    const selected = React.useRef<Range | null>(null)
    const queryStart = React.useRef<{node: Node, offset: number} | null>(null)
    const opened = React.useRef(false)
    const referenced = React.useRef(new Map<string, ReferenceValue | SubFlowValue>(
        (references ?? [])
            .filter(reference => !!reference.signature && !!reference.value)
            .map(reference => [reference.signature!, reference.value as ReferenceValue | SubFlowValue])))
    const [seed] = React.useState(value)
    const [context, setContext] = React.useState<CellContext>("none")
    const [hosts, setHosts] = React.useState<ReferenceHost[]>([])
    const [anchor, setAnchor] = React.useState<CaretAnchor | null>(null)
    const [query, setQuery] = React.useState("")

    const syncHosts = React.useCallback(() => {
        const element = editor.current
        if (!element) return

        const next = referenceHosts(element)

        setHosts(previous => previous.length === next.length
            && previous.every((host, index) => host.element === next[index]?.element)
            ? previous
            : next)
    }, [])

    const commit = useDebouncedCallback(() => {
        const element = editor.current
        if (!element) return

        syncHosts()

        const markdown = markdownFromElement(element)
        if (markdown === committed.current) return

        const signatures = (markdown.match(/\$\{[A-Za-z0-9_]+}/g) ?? []).map(token => token.slice(2, -1))

        committed.current = markdown
        onChange(markdown, signatures
            .filter((signature, index) => signatures.indexOf(signature) === index
                && referenced.current.has(signature))
            .map(signature => ({
                __typename: "InlineReferenceValue",
                signature,
                value: referenced.current.get(signature)!
            })))
    }, 400, {flushOnExit: true})

    const commitNow = React.useCallback(() => {
        commit()
        commit.flush()
    }, [commit])

    const focus = React.useCallback(() => {
        const element = editor.current
        if (!element) return

        const selection = window.getSelection()
        const current = selection?.rangeCount ? selection.getRangeAt(0) : null
        const inside = !!current && element.contains(current.commonAncestorContainer)
        const saved = selected.current

        element.focus()

        if (inside || !saved || !element.contains(saved.commonAncestorContainer)) return

        selection?.removeAllRanges()
        selection?.addRange(saved)
    }, [])

    const openAnchor = React.useCallback(() => {
        const element = editor.current
        if (!element || !referenceable) return

        const selection = window.getSelection()
        const current = selection?.rangeCount ? selection.getRangeAt(0) : null
        const range = current && element.contains(current.commonAncestorContainer) ? current : selected.current

        if (range) selected.current = range.cloneRange()

        const caretNode = range?.startContainer
        const block = caretNode?.nodeType === Node.ELEMENT_NODE
            ? caretNode as HTMLElement
            : caretNode?.parentElement ?? null

        const rect = range?.getClientRects()[0]
            ?? (block && element.contains(block) ? block.getBoundingClientRect() : undefined)
        const fallback = element.getBoundingClientRect()

        opened.current = true
        queryStart.current = range && range.endContainer.nodeType === Node.TEXT_NODE
            ? {node: range.endContainer, offset: range.endOffset}
            : null

        setQuery("")
        setAnchor(!rect || (rect.top === 0 && rect.left === 0)
            ? {top: fallback.top + 24, left: fallback.left + 8}
            : {top: rect.bottom, left: rect.left})
    }, [referenceable])

    const closeAnchor = React.useCallback(() => {
        opened.current = false
        queryStart.current = null

        setQuery("")
        setAnchor(null)
        focus()
    }, [focus])

    const caret = React.useCallback((): Range | null => {
        const element = editor.current
        const selection = window.getSelection()
        const range = selection?.rangeCount ? selection.getRangeAt(0) : null

        return element && range && element.contains(range.commonAncestorContainer) ? range : null
    }, [])

    const syncQuery = React.useCallback(() => {
        if (!opened.current) return

        const range = caret()

        if (!range || !range.collapsed || range.endContainer.nodeType !== Node.TEXT_NODE) {
            closeAnchor()
            return
        }

        const start = queryStart.current ?? {node: range.endContainer, offset: Math.max(range.endOffset - 1, 0)}

        queryStart.current = start

        if (range.endContainer !== start.node || range.endOffset < start.offset) {
            closeAnchor()
            return
        }

        const typed = (start.node.textContent ?? "").slice(start.offset, range.endOffset)

        if (typed.includes("\n")) {
            closeAnchor()
            return
        }

        setQuery(typed)
    }, [caret, closeAnchor])

    const selectQuery = React.useCallback(() => {
        const element = editor.current
        const start = queryStart.current
        const range = caret() ?? selected.current

        if (!element || !start || !range || !element.contains(start.node)) return
        if (range.endContainer !== start.node || range.endOffset <= start.offset) return

        const typed = document.createRange()

        typed.setStart(start.node, start.offset)
        typed.setEnd(start.node, range.endOffset)

        const selection = window.getSelection()

        selection?.removeAllRanges()
        selection?.addRange(typed)
    }, [caret])

    const input = React.useCallback(() => {
        syncQuery()
        commit()
    }, [syncQuery, commit])

    const runTableCommand = React.useCallback((command: TableCommand) => {
        const element = editor.current
        if (!element) return

        focus()

        const selection = window.getSelection()
        const cell = cellFromRange(element, selection?.rangeCount ? selection.getRangeAt(0) : null)
        if (!cell) return

        const target = applyTableCommand(cell, command)

        if (!target) setContext("none")

        if (target) {
            const range = document.createRange()
            range.selectNodeContents(target)
            range.collapse(true)
            selection?.removeAllRanges()
            selection?.addRange(range)
        }

        commitNow()
    }, [commitNow, focus])

    const clear = React.useCallback(() => {
        const element = editor.current
        if (!element) return

        element.innerHTML = ""
        setContext("none")
        commitNow()
    }, [commitNow])

    React.useEffect(() => {
        document.execCommand("defaultParagraphSeparator", false, "p")

        const listener = () => {
            const element = editor.current
            const selection = window.getSelection()
            if (!element || !selection?.rangeCount) return

            const range = selection.getRangeAt(0)
            if (!element.contains(range.commonAncestorContainer)) return

            selected.current = range.cloneRange()

            const next = cellContext(cellFromRange(element, range))

            setContext(previous => previous === next ? previous : next)
        }

        document.addEventListener("selectionchange", listener)
        return () => document.removeEventListener("selectionchange", listener)
    }, [])

    React.useEffect(() => {
        const element = editor.current
        if (!element) return

        mountReferenceHosts(element)
        syncHosts()
    }, [syncHosts])

    return {
        editor,
        referenced,
        seed,
        hosts,
        context,
        anchor,
        query,
        input,
        commit,
        flush: commit.flush,
        commitNow,
        focus,
        openAnchor,
        closeAnchor,
        selectQuery,
        runTableCommand,
        clear
    }
}
