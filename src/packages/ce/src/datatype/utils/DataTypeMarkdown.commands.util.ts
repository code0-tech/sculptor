import {IconString} from "@code0-tech/pictor";
import {TableCommand} from "@edition/datatype/utils/DataTypeMarkdown.applyTableCommand.util";

export type MarkdownCommand = {
    icon: IconString
    label: string
    shortcut?: string
} & (
    | {kind: "command", command: string}
    | {kind: "block", tag: string}
    | {kind: "wrap", tag: string, placeholder: string}
    | {kind: "html", html: string}
    | {kind: "link"}
    | {kind: "image"}
    )

export interface MarkdownTableCommand {
    command: TableCommand
    icon: IconString
    label: string
    bodyOnly?: true
}

export const formatCommands: MarkdownCommand[] = [
    {kind: "command", command: "bold", icon: "tabler:bold", label: "Bold", shortcut: "b"},
    {kind: "command", command: "italic", icon: "tabler:italic", label: "Italic", shortcut: "i"},
    {kind: "command", command: "strikeThrough", icon: "tabler:strikethrough", label: "Strikethrough"}
]

export const insertCommandGroups: MarkdownCommand[][] = [
    [
        {kind: "block", tag: "h1", icon: "tabler:h-1", label: "Heading 1"},
        {kind: "block", tag: "h2", icon: "tabler:h-2", label: "Heading 2"},
        {kind: "block", tag: "h3", icon: "tabler:h-3", label: "Heading 3"}
    ],
    [
        {kind: "command", command: "insertUnorderedList", icon: "tabler:list", label: "Bullet list"},
        {kind: "command", command: "insertOrderedList", icon: "tabler:list-numbers", label: "Numbered list"},
        {
            kind: "html",
            html: "<ul><li><input type=\"checkbox\"> Task</li></ul><p><br></p>",
            icon: "tabler:list-check",
            label: "Task list"
        },
        {kind: "block", tag: "blockquote", icon: "tabler:blockquote", label: "Quote"}
    ],
    [
        {kind: "wrap", tag: "code", placeholder: "code", icon: "tabler:code", label: "Inline code", shortcut: "e"},
        {
            kind: "html",
            html: "<pre><code>code</code></pre><p><br></p>",
            icon: "tabler:source-code",
            label: "Code block"
        },
        {
            kind: "html",
            html: "<table><thead><tr><th>Column</th><th>Column</th></tr></thead>"
                + "<tbody><tr><td>Cell</td><td>Cell</td></tr></tbody></table><p><br></p>",
            icon: "tabler:table",
            label: "Table"
        },
        {kind: "command", command: "insertHorizontalRule", icon: "tabler:minus", label: "Divider"}
    ],
    [
        {kind: "link", icon: "tabler:link", label: "Link", shortcut: "k"},
        {kind: "image", icon: "tabler:photo", label: "Image"}
    ]
]

export const tableCommandGroups: MarkdownTableCommand[][] = [
    [
        {command: "row-above", icon: "tabler:row-insert-top", label: "Insert row above", bodyOnly: true},
        {command: "row-below", icon: "tabler:row-insert-bottom", label: "Insert row below"},
        {command: "column-left", icon: "tabler:column-insert-left", label: "Insert column left"},
        {command: "column-right", icon: "tabler:column-insert-right", label: "Insert column right"}
    ],
    [
        {command: "delete-row", icon: "tabler:row-remove", label: "Delete row", bodyOnly: true},
        {command: "delete-column", icon: "tabler:column-remove", label: "Delete column"},
        {command: "delete-table", icon: "tabler:trash", label: "Delete table"}
    ]
]
