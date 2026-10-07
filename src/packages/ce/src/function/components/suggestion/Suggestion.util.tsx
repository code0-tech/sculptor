import {
    Flow,
    LiteralValue,
    NodeFunction,
    ReferencePath,
    ReferenceValue,
    SubFlowValue
} from "@code0-tech/sagittarius-graphql-types";
import {useService, useStore} from "@code0-tech/pictor";
import {ModuleService} from "@edition/module/services/Module.service";
import {FunctionService} from "@edition/function/services/Function.service";
import React from "react";

export type SuggestionValue = LiteralValue | ReferenceValue | NodeFunction | SubFlowValue

export type SuggestionTagKey = string | number | boolean | null

export interface Suggestion {
    value: SuggestionValue
    variants: SuggestionValue[]
    displayMessage: string
    definitionSource: string
    aliases: string[]
    icon?: string
    description?: string
}

export interface SuggestionGroup {
    suggestions: Suggestion[]
    displayMessage?: string
    icon?: string
}

export const useMappedSuggestions = (
    suggestions: SuggestionValue[],
    only?: SuggestionValue["__typename"] | SuggestionValue["__typename"][]
): SuggestionGroup[] => {

    const moduleService = useService(ModuleService)
    const moduleStore = useStore(ModuleService)
    const functionService = useService(FunctionService)
    const functionStore = useStore(FunctionService)

    const modules = React.useMemo(
        () => [...moduleService.values(), {
            identifier: "sub-flow-values",
            names: [{content: "Static functions"}],
            icon: "tabler:circle-dot"
        }],
        [moduleService, moduleStore]
    )

    const functions = React.useMemo(
        () => functionService.values(),
        [functionService, functionStore]
    )

    const onlyKey = Array.isArray(only) ? only.join("|") : only ?? ""

    const onlyTypes = React.useMemo(
        () => only === undefined ? undefined : Array.isArray(only) ? only : [only],
        [onlyKey]
    )

    return React.useMemo(() => {

        const mappedSuggestions = suggestions.filter(suggestion => !onlyTypes || onlyTypes.includes(suggestion.__typename)).map((suggestion) => {

            if (suggestion.__typename === "NodeFunction") {
                const functionDefinition = functions.find(f => f.id === suggestion.functionDefinition?.id)
                if (!functionDefinition) return null
                const module = modules.find(m => m.id === functionDefinition?.runtimeModule?.id)

                return {
                    value: suggestion,
                    icon: functionDefinition?.displayIcon,
                    displayMessage: functionDefinition?.names?.[0].content,
                    aliases: functionDefinition?.aliases?.[0]?.content?.split(";"),
                    definitionSource: module?.identifier,
                    description: functionDefinition?.descriptions?.[0]?.content,
                }
            }

            if (suggestion.__typename === "LiteralValue") {

                return {
                    value: suggestion,
                    icon: "",
                    displayMessage: "functionDefinition?.names?.[0].content",
                    aliases: [""],
                    definitionSource: "literal-values",
                    description: "functionDefinition?.descriptions?.[0].content",
                }
            }

            if (suggestion.__typename === "SubFlowValue" && suggestion.functionDefinition?.id) {

                return {
                    value: suggestion,
                    icon: suggestion.functionDefinition?.displayIcon,
                    displayMessage: suggestion.functionDefinition?.names?.[0]?.content,
                    aliases: (suggestion.functionDefinition?.aliases?.[0]?.content ?? "")?.split(";"),
                    definitionSource: suggestion.functionDefinition.runtimeModule?.identifier,
                    description: suggestion.functionDefinition?.descriptions?.[0]?.content ?? "",
                }
            }

            return null
        }).filter((Boolean)) as Omit<Suggestion, "variants">[]

        const collapsedSuggestions: Suggestion[] = []
        const byFunction = new Map<string, Suggestion>()

        mappedSuggestions.forEach((mapped) => {

            const value = mapped.value
            const functionId = value.__typename === "NodeFunction" ? value.functionDefinition?.id
                : value.__typename === "SubFlowValue" ? value.functionDefinition?.id
                    : undefined

            const existing = functionId ? byFunction.get(functionId) : undefined

            if (existing) {
                existing.variants.push(value)
                return
            }

            const suggestion: Suggestion = {...mapped, variants: [value]}
            if (functionId) byFunction.set(functionId, suggestion)
            collapsedSuggestions.push(suggestion)
        })

        const groupedByModule = new Map<string, { suggestions: Suggestion[], module: any }>()

        collapsedSuggestions.forEach((suggestion) => {
            const moduleId = suggestion.definitionSource
            const module = modules.find(m => m.identifier === moduleId)

            if (!groupedByModule.has(moduleId)) {
                groupedByModule.set(moduleId, {
                    suggestions: [],
                    module: module
                })
            }

            groupedByModule.get(moduleId)!.suggestions.push(suggestion)
        })

        return [
            ...(onlyTypes ? [] : [{
                suggestions: collapsedSuggestions,
                displayMessage: "All",
                icon: undefined
            }]),
            ...Array.from(groupedByModule.values()).map((group) => ({
                suggestions: group.suggestions,
                displayMessage: group.module?.names?.[0].content,
                icon: group.module?.icon
            }))
        ]
    }, [suggestions, onlyTypes, modules, functions])
}

export interface SuggestionPathNode {
    label: string
    value?: ReferenceValue
    index?: number
    children: Map<string, SuggestionPathNode>
}

export interface SuggestionReferenceGroup {
    root: ReferenceValue
    targetNodeId: string
    value?: ReferenceValue
    index?: number
    children: Map<string, SuggestionPathNode>
    suggestions: { value: ReferenceValue, index: number }[]
}

export type SuggestionMenuEntry =
    | { kind: "value", value: LiteralValue | SubFlowValue | NodeFunction, index: number }
    | { kind: "reference-group", key: string, group: SuggestionReferenceGroup }

const referenceGroupKey = (value: ReferenceValue): string =>
    [value.nodeFunctionId, value.inputTypeIdentifier, value.inputIndex, value.parameterIndex].join("/")

const referencePathLabel = (segment: ReferencePath): string =>
    `${segment.path ?? ""}${segment.arrayIndex != null ? `[${segment.arrayIndex}]` : ""}`

const newReferenceGroup = (root: ReferenceValue, flowId: Flow['id']): SuggestionReferenceGroup => {
    const nodeFunctionId = root.nodeFunctionId as string | null | undefined

    return {
        root: {...root, referencePath: undefined},
        targetNodeId: (!nodeFunctionId || nodeFunctionId === "undefined" ? flowId : nodeFunctionId) as string,
        children: new Map(),
        suggestions: []
    }
}

const childPathNode = (children: Map<string, SuggestionPathNode>, label: string): SuggestionPathNode => {
    const existing = children.get(label)
    if (existing) return existing

    const created: SuggestionPathNode = {label, children: new Map()}
    children.set(label, created)
    return created
}

const pathNodeAt = (group: SuggestionReferenceGroup, segments: ReferencePath[]): SuggestionPathNode =>
    segments.reduce(
        (parent, segment) => childPathNode(parent.children, referencePathLabel(segment)),
        {label: "", children: group.children} as SuggestionPathNode
    )

export const useSuggestionMenuEntries = (suggestions: SuggestionValue[], flowId: Flow['id']) => {

    const moduleGroups = useMappedSuggestions(suggestions, ["SubFlowValue", "NodeFunction"])

    const groupedValues = React.useMemo(
        () => new Set(moduleGroups.flatMap(group => group.suggestions.flatMap(suggestion => suggestion.variants))),
        [moduleGroups]
    )

    const entries = React.useMemo(() => {

        const groups = new Map<string, SuggestionReferenceGroup>()

        return suggestions.flatMap((suggest, index): SuggestionMenuEntry[] => {

            if (suggest.__typename === "LiteralValue") return [{kind: "value", value: suggest, index}]

            if (suggest.__typename === "SubFlowValue" || suggest.__typename === "NodeFunction")
                return groupedValues.has(suggest) ? [] : [{kind: "value", value: suggest, index}]

            if (suggest.__typename !== "ReferenceValue") return []

            const key = referenceGroupKey(suggest)
            const known = groups.get(key)
            const group = known ?? newReferenceGroup(suggest, flowId)
            const segments = suggest.referencePath ?? []

            groups.set(key, group)
            group.suggestions.push({value: suggest, index})

            const target = segments.length <= 0 ? group : pathNodeAt(group, segments)
            target.value = suggest
            target.index = index

            return known ? [] : [{kind: "reference-group", key, group}]
        })
    }, [suggestions, groupedValues, flowId])

    return {entries, moduleGroups}
}
