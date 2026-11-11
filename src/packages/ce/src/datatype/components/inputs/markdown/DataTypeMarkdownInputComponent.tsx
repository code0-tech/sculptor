import React from "react";
import {createPortal} from "react-dom";
import {useService} from "@code0-tech/pictor";
import {
    Flow,
    InlineReferenceValue,
    NodeFunction,
    ReferenceValue,
    SubFlowValue
} from "@code0-tech/sagittarius-graphql-types";
import {useParams} from "next/navigation";
import {SuggestionValue} from "@edition/function/components/suggestion/Suggestion.util";
import {
    DataTypeInputMenuSuggestionsComponent
} from "@edition/datatype/components/inputs/DataTypeInputMenuSuggestionsComponent";
import {FlowService} from "@edition/flow/services/Flow.service";
import {useMarkdownDocument} from "@edition/datatype/hooks/DataTypeMarkdown.document.hook";
import {
    DataTypeMarkdownToolbarComponent
} from "@edition/datatype/components/inputs/markdown/DataTypeMarkdownToolbarComponent";
import {
    DataTypeMarkdownEditorComponent
} from "@edition/datatype/components/inputs/markdown/DataTypeMarkdownEditorComponent";
import {ReferenceEntryBadgeComponent} from "@edition/datatype/components/badges/ReferenceEntryBadgeComponent";
import {MarkdownCommand} from "@edition/datatype/utils/DataTypeMarkdown.commands.util";
import "./DataTypeMarkdownInputComponent.style.scss";

export interface DataTypeMarkdownInputComponentProps {
    value: string
    references?: InlineReferenceValue[] | null
    onChange: (value: string, references: InlineReferenceValue[]) => void
    label?: string
    placeholder?: string
    suggestions?: SuggestionValue[]
    signaturePrefix?: string
    flowId?: Flow['id']
    nodeId?: NodeFunction['id']
    parameterIndex?: number
    onSelect?: (value: SuggestionValue) => void
    actions?: React.ReactElement
}

export const DataTypeMarkdownInputComponent: React.FC<DataTypeMarkdownInputComponentProps> = (props) => {

    const {
        value,
        references,
        label,
        placeholder,
        suggestions,
        signaturePrefix,
        nodeId,
        parameterIndex,
        actions,
        onChange,
        onSelect
    } = props

    const params = useParams()
    const flowService = useService(FlowService)

    const flowId: Flow['id'] = props.flowId ?? `gid://sagittarius/Flow/${Number(params.flowId) || 1}`

    const inlineSuggestions = React.useMemo(() => (suggestions ?? []).filter(suggestion =>
        suggestion.__typename === "LiteralValue" || suggestion.__typename === "ReferenceValue"), [suggestions])

    const markdown = useMarkdownDocument({
        value,
        references,
        referenceable: inlineSuggestions.length > 0,
        onChange
    })

    const insertReference = React.useCallback((suggestion: SuggestionValue) => {
        markdown.focus()
        markdown.selectQuery()

        if (suggestion.__typename === "LiteralValue") {
            document.execCommand("insertText", false, String(suggestion.value ?? ""))
            markdown.commitNow()
            return
        }

        const selection = window.getSelection()
        const range = selection?.rangeCount ? selection.getRangeAt(0) : null

        if (!selection || !range) return

        const addedNodeId = suggestion.__typename === "NodeFunction"
            ? flowService.addPreviousNodeById(flowId, nodeId ?? null, suggestion)
            : undefined

        if (suggestion.__typename === "NodeFunction" && !addedNodeId) return

        const reference: ReferenceValue | SubFlowValue = addedNodeId
            ? {__typename: "ReferenceValue", nodeFunctionId: addedNodeId}
            : suggestion as ReferenceValue | SubFlowValue

        const taken = new Set(markdown.referenced.current.keys())
        const signature = Array.from({length: taken.size + 1},
            (_, index) => `${signaturePrefix ?? "ref"}_${index}`).find(candidate => !taken.has(candidate))!

        const host = document.createElement("span")
        const spacer = document.createTextNode("\u00a0")

        host.className = "data-type-markdown-input__reference"
        host.dataset.reference = signature
        host.contentEditable = "false"

        markdown.referenced.current.set(signature, reference)

        range.deleteContents()
        range.insertNode(spacer)
        range.insertNode(host)
        range.setStartAfter(spacer)
        range.collapse(true)

        selection.removeAllRanges()
        selection.addRange(range)

        markdown.commitNow()
    }, [markdown, flowService, flowId, nodeId, signaturePrefix])

    const runCommand = React.useCallback((command: MarkdownCommand) => {
        markdown.focus()

        const text = window.getSelection()?.toString() ?? ""
        const url = /^(https?:\/\/|mailto:|\/)\S+$/.test(text.trim()) ? text.trim() : "https://"
        const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

        if (command.kind === "command") document.execCommand(command.command)
        if (command.kind === "html") document.execCommand("insertHTML", false, command.html)
        if (command.kind === "wrap") document.execCommand("insertHTML", false,
            `<${command.tag}>${escaped || command.placeholder}</${command.tag}>`)
        if (command.kind === "image") document.execCommand("insertHTML", false,
            `<img src="${url}" alt="${escaped || "image"}">`)
        if (command.kind === "link" && text.length > 0) document.execCommand("createLink", false, url)
        if (command.kind === "link" && text.length <= 0) document.execCommand("insertHTML", false,
            `<a href="https://">link</a>`)
        if (command.kind === "block") document.execCommand("formatBlock", false,
            document.queryCommandValue("formatBlock").toLowerCase() === command.tag ? "p" : command.tag)

        markdown.commitNow()
    }, [markdown])

    React.useEffect(() => {
        if (!markdown.anchor) return

        const frame = requestAnimationFrame(() => markdown.focus())

        return () => cancelAnimationFrame(frame)
    }, [markdown.anchor, markdown.focus])

    return <div className={"data-type-markdown-input"}>
        <DataTypeMarkdownToolbarComponent cellContext={markdown.context}
                                          suggestions={suggestions}
                                          nodeId={nodeId}
                                          parameterIndex={parameterIndex}
                                          actions={actions}
                                          onCommand={runCommand}
                                          onTableCommand={markdown.runTableCommand}
                                          onSelect={onSelect}
                                          onClear={markdown.clear}/>
        <DataTypeMarkdownEditorComponent editor={markdown.editor}
                                         seed={markdown.seed}
                                         label={label}
                                         placeholder={placeholder}
                                         onInput={markdown.input}
                                         onFlush={markdown.flush}
                                         onCommand={runCommand}
                                         onReference={markdown.openAnchor}/>
        <DataTypeInputMenuSuggestionsComponent mode={"menu"}
                                               suggestions={inlineSuggestions}
                                               flowId={flowId}
                                               nodeId={nodeId}
                                               parameterIndex={parameterIndex}
                                               anchor={markdown.anchor}
                                               query={markdown.query}
                                               open={!!markdown.anchor}
                                               onOpenChange={open => {
                                                   if (!open) markdown.closeAnchor()
                                               }}
                                               onSelect={insertReference}/>
        {markdown.hosts.map(host => {
            const reference = markdown.referenced.current.get(host.signature)

            if (!reference) return null

            return createPortal(<ReferenceEntryBadgeComponent value={reference}/>, host.element, host.signature)
        })}
    </div>
}
