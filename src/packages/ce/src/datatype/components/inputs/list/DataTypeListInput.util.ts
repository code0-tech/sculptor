import {TagValue} from "@code0-tech/pictor";
import {
    Flow,
    InlineReferenceValue,
    LiteralValue,
    NodeFunction,
    ReferenceValue,
    SubFlowValue
} from "@code0-tech/sagittarius-graphql-types";
import {ListInput, NodeSchema, Schema} from "@code0-tech/triangulum";
import {FlowService} from "@edition/flow/services/Flow.service";
import {DataTypeInputComponentProps} from "@edition/datatype/components/inputs/DataTypeInputComponent";
import {SuggestionTagKey, SuggestionValue} from "@edition/function/components/suggestion/Suggestion.util";

export type ListEntry =
    | SuggestionTagKey
    | ListEntry[]
    | {[key: string]: ListEntry}
    | ReferenceValue
    | SubFlowValue
    | NodeFunction

export const listElementSuggestions = (
    schema: DataTypeInputComponentProps['schema'],
    suggestions: DataTypeInputComponentProps['suggestions']
): SuggestionValue[] => {
    const inner = schema && "schema" in schema ? (schema as NodeSchema).schema : (schema as Schema | undefined)
    const declared = (inner as ListInput | undefined)?.declaredItems ?? []
    const elements = (suggestions ?? []).filter(suggest =>
        !(suggest.__typename === "LiteralValue" && Array.isArray(suggest.value)))

    const all = [...declared.flatMap(item => item.suggestions ?? []), ...elements]
    const keys = all.map(suggest => JSON.stringify(suggest))

    return all.filter((suggest, index) => keys.indexOf(keys[index]) === index)
}

export const listTagKeys = (elementSuggestions: SuggestionValue[]): SuggestionTagKey[] =>
    elementSuggestions.map((suggest, index) =>
        suggest.__typename === "LiteralValue" ? suggest.value as SuggestionTagKey : `\${reference_${index}}`)

export const listInitialLiteral = (initialValue: DataTypeInputComponentProps['initialValue']): LiteralValue | undefined =>
    (initialValue as LiteralValue)?.__typename === "LiteralValue" ? (initialValue as LiteralValue) : undefined

export const listInitialArray = (initialValue: DataTypeInputComponentProps['initialValue']): ListEntry[] => {
    const literal = listInitialLiteral(initialValue)
    return Array.isArray(literal?.value) ? literal.value as ListEntry[] : []
}

export const listInitialTags = (initialArray: ListEntry[], literalTags = false): TagValue[] =>
    initialArray.map((entry, index) => ({
        value: literalTags && !(typeof entry === "string" && /^\$\{.+}$/.test(entry))
            ? `\${literal_${index}}`
            : entry
    }))

export const listReferences = (
    elementSuggestions: SuggestionValue[],
    initialValue: DataTypeInputComponentProps['initialValue']
): Map<string, ReferenceValue | SubFlowValue | NodeFunction> => {

    const fromSuggestions = elementSuggestions
        .map((suggest, index) => ({key: `\${reference_${index}}`, value: suggest}))
        .filter(entry => entry.value.__typename !== "LiteralValue")

    const fromInitialValue = (listInitialLiteral(initialValue)?.references ?? [])
        .filter(reference => !!reference?.value)
        .map(reference => ({key: `\${${reference.signature}}`, value: reference.value!}))

    return new Map([...fromSuggestions, ...fromInitialValue].map(entry =>
        [entry.key, entry.value as ReferenceValue | SubFlowValue | NodeFunction]))
}

export const listCurrentEntries = (
    initialArray: ListEntry[],
    references: Map<string, ReferenceValue | SubFlowValue | NodeFunction>
): ListEntry[] => initialArray.map(entry =>
    typeof entry === "string" ? references.get(entry) ?? entry : entry)

export const listValueKey = (value: ListEntry | ListEntry[], references?: InlineReferenceValue[] | null): string =>
    JSON.stringify([value, references ?? []])

export const toListEntry = (
    value: LiteralValue | ReferenceValue | SubFlowValue | NodeFunction | null,
    flowService: FlowService,
    flowId: Flow['id'],
    nodeId?: NodeFunction['id']
): ListEntry => {
    if (!value) return null
    if (value.__typename === "LiteralValue") return value.value as ListEntry

    if (value.__typename === "NodeFunction") {
        const addedNodeId = flowService.addPreviousNodeById(flowId, nodeId ?? null, value)
        return addedNodeId ? {__typename: "ReferenceValue", nodeFunctionId: addedNodeId} : null
    }

    return value as ReferenceValue | SubFlowValue
}

const isListReference = (entry: ListEntry): entry is ReferenceValue | SubFlowValue =>
    (entry as ReferenceValue | SubFlowValue | null)?.__typename === "ReferenceValue"
    || (entry as ReferenceValue | SubFlowValue | null)?.__typename === "SubFlowValue"

export const toListLiteral = (
    entries: ListEntry[],
    references: Map<string, ReferenceValue | SubFlowValue | NodeFunction>
): LiteralValue => {

    const referenceIndexes = entries.flatMap((entry, index) => isListReference(entry) ? [index] : [])
    const signatures = new Map(referenceIndexes.map((index, position) => [index, `item_${position}`]))

    const inlineReferences: InlineReferenceValue[] = [...signatures].map(([index, signature]) => ({
        __typename: "InlineReferenceValue",
        signature,
        value: entries[index] as ReferenceValue | SubFlowValue
    }))

    inlineReferences.forEach(reference =>
        references.set(`\${${reference.signature}}`, reference.value as ReferenceValue | SubFlowValue))

    return {
        __typename: "LiteralValue",
        value: entries.map((entry, index) => {
            const signature = signatures.get(index)
            return signature ? `\${${signature}}` : entry ?? null
        }),
        ...(inlineReferences.length > 0 ? {references: inlineReferences} : {})
    }
}
