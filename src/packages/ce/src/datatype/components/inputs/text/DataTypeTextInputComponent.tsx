import React from "react";
import {DataTypeInputComponentProps} from "../DataTypeInputComponent";
import {
    EditorInput,
    EditorInputTrigger,
    EditorInputValue,
    EditorTokenRule,
    Flex,
    InputDescription,
    InputLabel,
    Text
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
import {
    DataTypeInputMenuSuggestionsComponent
} from "@edition/datatype/components/inputs/DataTypeInputMenuSuggestionsComponent";
import {ReferenceEntryBadgeComponent} from "@edition/datatype/components/badges/ReferenceEntryBadgeComponent";
import {listTagKeys} from "@edition/datatype/components/inputs/list/DataTypeListInput.util";
import {SuggestionValue} from "@edition/function/components/suggestion/Suggestion.util";

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

    const referenced = React.useRef(new Map<string, ReferenceValue | SubFlowValue>(
        (initialValue?.__typename === "LiteralValue" ? initialValue.references ?? [] : [])
            .filter(reference => !!reference.signature && !!reference.value)
            .map(reference => [reference.signature!, reference.value as ReferenceValue | SubFlowValue])))
    const [revision, setRevision] = React.useState(0)
    const [preferMarkdown, setPreferMarkdown] = React.useState<boolean | null>(null)

    const reference = !!initialValue && initialValue.__typename !== "LiteralValue"
    const literal = initialValue?.__typename === "LiteralValue" ? String(initialValue.value ?? "") : ""
    const markdown = !reference && (preferMarkdown ?? isMarkdown(literal))

    const defaultValue: NodeParameterValue | NodeFunction | undefined = React.useMemo(() => initialValue ?? undefined, [initialValue])
    const inlineSuggestions = React.useMemo(() => (suggestions ?? []).filter(suggestion =>
        suggestion.__typename === "LiteralValue" || suggestion.__typename === "ReferenceValue"), [suggestions])
    const inlineTagKeys = React.useMemo(() => listTagKeys(inlineSuggestions), [inlineSuggestions])
    const tokenRules = React.useMemo<EditorTokenRule[]>(() => [
        {
            pattern: /\$\{[A-Za-z0-9_]+}/g,
            void: true,
            wrap: matchedText => {
                const reference = referenced.current.get(matchedText.slice(2, -1))

                if (!reference) return <Text size={"sm"}>{matchedText}</Text>

                return <ReferenceEntryBadgeComponent value={reference}/>
            }
        }
    ], [])

    const toLiteral = React.useCallback((value: string): LiteralValue | null => {
        if (!value) return null

        const signatures = (value.match(/\$\{[A-Za-z0-9_]+}/g) ?? []).map(token => token.slice(2, -1))
        const references: InlineReferenceValue[] = signatures
            .filter((signature, index) => signatures.indexOf(signature) === index
                && referenced.current.has(signature))
            .map(signature => ({
                __typename: "InlineReferenceValue",
                signature,
                value: referenced.current.get(signature)!
            }))

        return {__typename: "LiteralValue", value: value, ...(references.length > 0 ? {references} : {})}
    }, [])

    const onChangeDebounced = useDebouncedCallback((
        value: string | LiteralValue | SubFlowValue | NodeFunction | ReferenceValue | null
    ) => {
        if (typeof value === "string") {
            onChange?.(toLiteral(value))
            return
        }

        onChange?.(value)
    }, 400)

    const onValueChange = React.useCallback((
        value: string | LiteralValue | SubFlowValue | NodeFunction | ReferenceValue | null
    ) => {
        if (typeof value === "string") {
            formValidation?.setValue?.(toLiteral(value))
        } else {
            formValidation?.setValue?.(value)
        }

        onChangeDebounced(value)
    }, [formValidation, onChangeDebounced])

    const onInsertReference = React.useCallback((suggestion: SuggestionValue) => {
        if (suggestion.__typename === "LiteralValue") {
            onValueChange(`${literal}${String(suggestion.value ?? "")}`)
            return
        }

        const taken = new Set(referenced.current.keys())
        const signature = Array.from({length: taken.size + 1}, (_, index) => `ref_${index}`)
            .find(candidate => !taken.has(candidate))!

        referenced.current.set(signature, suggestion as ReferenceValue | SubFlowValue)
        onValueChange(`${literal}\${${signature}}`)
    }, [literal, onValueChange])

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
                             onSelect={(_, data) => onInsertReference(data as SuggestionValue)}
                             formValidation={{...formValidation, setValue: undefined}}
                             maw={"100%"}
                             placeholder={String(title) ?? ""}
                             right={
                                 <DataTypeInputControlsComponent suggestions={suggestions}
                                                                 onSelect={onValueChange}/>
                             }
                             rightType={"action"}>
                    <DataTypeInputMenuSuggestionsComponent mode={"editor"}
                                                           suggestions={inlineSuggestions}
                                                           tagKeys={inlineTagKeys}
                                                           flowId={props.flowId}
                                                           nodeId={props.nodeId}
                                                           parameterIndex={props.parameterIndex}/>
                    <EditorInputValue/>
                    <EditorInputTrigger/>
                </EditorInput>
            </DataTypeInputValueComponent>
            {!reference && toggle}
        </>
    }, [formValidation, defaultValue, markdown, revision, inlineSuggestions])
}
