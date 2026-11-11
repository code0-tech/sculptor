import React from "react";
import {DataTypeInputComponentProps} from "../DataTypeInputComponent";
import {
    EditorInput,
    EditorInputValue,
    EditorTokenRule,
    Flex,
    InputDescription,
    InputLabel
} from "@code0-tech/pictor";
import {useDebouncedCallback} from "use-debounce";
import {
    InlineReferenceValue,
    LiteralValue,
    NodeFunction,
    NodeParameterValue,
    ReferenceValue,
    SubFlowValue
} from "@code0-tech/sagittarius-graphql-types";
import {DataTypeInputControlsComponent} from "@edition/datatype/components/inputs/DataTypeInputControlsComponent";
import {DataTypeInputValueComponent} from "@edition/datatype/components/inputs/DataTypeInputValueComponent";
import {DataTypeMarkdownInputComponent} from "@edition/datatype/components/inputs/markdown/DataTypeMarkdownInputComponent";
import {DataTypeMarkdownToggleComponent} from "@edition/datatype/components/inputs/markdown/DataTypeMarkdownToggleComponent";
import {isMarkdown} from "@edition/datatype/utils/DataTypeMarkdown.isMarkdown.util";

/**
 * TODO: markdown support lives here only until markdown gets its own DataType.
 *
 * Today this component sniffs the literal value via `isMarkdown`, keeps a local
 * `preferMarkdown` toggle and swaps between `DataTypeMarkdownInputComponent` and the
 * plain `EditorInput`. Once Sagittarius ships a markdown DataType:
 *  - revert this component to the plain text editor (no toggle, no detection, no `revision` remount)
 *  - register the markdown input as its own variant in `DataTypeInputComponent`, selected by the
 *    DataType instead of by content
 *  - delete `DataTypeMarkdown.isMarkdown.util` and the `DataTypeMarkdownToggleComponent` usage here
 */
export type DataTypeTextInputComponentProps = DataTypeInputComponentProps

export const DataTypeTextInputComponent: React.FC<DataTypeTextInputComponentProps> = (props) => {

    const {formValidation, title, initialValue, description, suggestions, onChange} = props

    const [revision, setRevision] = React.useState(0)
    const [preferMarkdown, setPreferMarkdown] = React.useState<boolean | null>(null)

    const reference = !!initialValue && initialValue.__typename !== "LiteralValue"
    const literal = initialValue?.__typename === "LiteralValue" ? String(initialValue.value ?? "") : ""
    const markdown = !reference && (preferMarkdown ?? isMarkdown(literal))

    const defaultValue: NodeParameterValue | NodeFunction | undefined = React.useMemo(() => initialValue ?? undefined, [initialValue])
    const tokenRules = React.useMemo<EditorTokenRule[]>(() => [], [])

    const onChangeDebounced = useDebouncedCallback((
        value: string | LiteralValue | SubFlowValue | NodeFunction | ReferenceValue | null
    ) => {
        if (typeof value === "string") {
            onChange?.(value ? {__typename: "LiteralValue", value: value} : null)
            return
        }

        onChange?.(value)
    }, 400)

    const onValueChange = React.useCallback((
        value: string | LiteralValue | SubFlowValue | NodeFunction | ReferenceValue | null
    ) => {
        if (typeof value === "string") {
            formValidation?.setValue?.(value ? {__typename: "LiteralValue", value: value} : null)
        } else {
            formValidation?.setValue?.(value)
        }

        onChangeDebounced(value)
    }, [formValidation, onChangeDebounced])

    const onMarkdownChange = React.useCallback((value: string, references: InlineReferenceValue[]) => {
        const changed: LiteralValue | null = value ? {
            __typename: "LiteralValue",
            value: value,
            ...(references.length > 0 ? {references} : {})
        } : null

        formValidation?.setValue?.(changed)
        onChangeDebounced(changed)
    }, [formValidation, onChangeDebounced])

    const onToggle = React.useCallback(() => {
        onChangeDebounced.flush()
        setPreferMarkdown(!markdown)
        setRevision(current => current + 1)
    }, [markdown, onChangeDebounced])

    return React.useMemo(() => {
        const toggle = <Flex style={{marginTop: "0.35rem"}}>
            <DataTypeMarkdownToggleComponent markdown={markdown}
                                             plainIcon={"tabler:text-size"}
                                             plainLabel={"Edit as text"}
                                             markdownLabel={"Edit as markdown"}
                                             onToggle={onToggle}/>
        </Flex>

        const header = <>
            {title && <InputLabel>{title}</InputLabel>}
            {description && <InputDescription>{description}</InputDescription>}
        </>

        if (markdown) return <>
            {header}
            <DataTypeMarkdownInputComponent key={revision}
                                            value={literal}
                                            references={initialValue?.__typename === "LiteralValue"
                                                ? initialValue.references
                                                : undefined}
                                            label={typeof title === "string" ? title : undefined}
                                            placeholder={typeof title === "string" ? title : undefined}
                                            suggestions={suggestions}
                                            nodeId={props.nodeId}
                                            parameterIndex={props.parameterIndex}
                                            onSelect={onValueChange}
                                            onChange={onMarkdownChange}/>
            {toggle}
        </>

        return <>
            {header}
            <DataTypeInputValueComponent key={revision}
                                         initialValue={initialValue}
                                         onChange={onValueChange}
                                         suggestions={suggestions}
                                         formValidation={formValidation}>
                <EditorInput initialValue={(defaultValue as LiteralValue)?.value?.toString()}
                             tokenRules={tokenRules}
                             onChange={onValueChange}
                             formValidation={{...formValidation, setValue: undefined}}
                             maw={"100%"}
                             placeholder={String(title) ?? ""}
                             right={
                                 <DataTypeInputControlsComponent suggestions={suggestions}
                                                                 onSelect={onValueChange}/>
                             }
                             rightType={"action"}>
                    <EditorInputValue/>
                </EditorInput>
            </DataTypeInputValueComponent>
            {!reference && toggle}
        </>
    }, [formValidation, defaultValue, markdown, revision])
}
