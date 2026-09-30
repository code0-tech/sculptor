import {LiteralValue, NodeFunction, ReferenceValue, SubFlowValue} from "@code0-tech/sagittarius-graphql-types";
import {useService, useStore} from "@code0-tech/pictor";
import {ModuleService} from "@edition/module/services/Module.service";
import {FunctionService} from "@edition/function/services/Function.service";
import React from "react";

export type SuggestionValue = LiteralValue | ReferenceValue | NodeFunction | SubFlowValue

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
