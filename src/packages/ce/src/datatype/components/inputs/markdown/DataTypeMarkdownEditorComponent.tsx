import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
    formatCommands,
    insertCommandGroups,
    MarkdownCommand
} from "@edition/datatype/utils/DataTypeMarkdown.commands.util";

export interface DataTypeMarkdownEditorComponentProps {
    editor: React.RefObject<HTMLDivElement | null>
    seed: string
    label?: string
    placeholder?: string
    onInput: () => void
    onFlush: () => void
    onCommand: (command: MarkdownCommand) => void
    onReference: () => void
}

export const DataTypeMarkdownEditorComponent: React.FC<DataTypeMarkdownEditorComponentProps> = (props) => {

    const {editor, seed, label, placeholder, onInput, onFlush, onCommand, onReference} = props

    const rendered = React.useMemo(() => <ReactMarkdown remarkPlugins={[remarkGfm]}
                                                        components={{
                                                            input: ({type, checked}) => type === "checkbox"
                                                                ? <input type={"checkbox"} defaultChecked={!!checked}/>
                                                                : null
                                                        }}>
        {seed}
    </ReactMarkdown>, [seed])

    const onKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
        event.stopPropagation()

        if (!event.metaKey && !event.ctrlKey) return

        if (event.code === "Space") {
            event.preventDefault()
            onReference()
            return
        }

        const command = [...formatCommands, ...insertCommandGroups.flat()]
            .find(candidate => candidate.shortcut === event.key.toLowerCase())
        if (!command) return

        event.preventDefault()
        onCommand(command)
    }, [onCommand, onReference])

    return <div className={"data-type-markdown-input__editor"}
                ref={editor}
                contentEditable
                suppressContentEditableWarning
                role={"textbox"}
                aria-multiline={true}
                aria-label={label}
                data-placeholder={placeholder ?? "Write something…"}
                onInput={onInput}
                onBlur={onFlush}
                onPaste={event => {
                    event.preventDefault()
                    document.execCommand("insertText", false, event.clipboardData.getData("text/plain"))
                    onInput()
                }}
                onDrop={event => {
                    event.preventDefault()
                    document.execCommand("insertText", false, event.dataTransfer.getData("text/plain"))
                    onInput()
                }}
                onClick={event => {
                    if ((event.target as HTMLElement).tagName === "INPUT") onInput()
                }}
                onKeyDown={onKeyDown}>
        {rendered}
    </div>
}
