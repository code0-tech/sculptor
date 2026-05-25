import {LiteralValue, NodeFunction, ReferenceValue} from "@code0-tech/sagittarius-graphql-types";
import {useService, useStore} from "@code0-tech/pictor";
import {ModuleService} from "@edition/module/services/Module.service";
import {FunctionService} from "@edition/function/services/Function.service";
import React from "react";

export interface Suggestion {
    value: LiteralValue | ReferenceValue | NodeFunction
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

export const useMappedSuggestions = (suggestions: (NodeFunction | ReferenceValue | LiteralValue)[]): SuggestionGroup[] => {

    const moduleService = useService(ModuleService)
    const moduleStore = useStore(ModuleService)
    const functionService = useService(FunctionService)
    const functionStore = useStore(FunctionService)

    const modules = React.useMemo(
        () => moduleService.values(),
        [moduleService, moduleStore]
    )

    const functions = React.useMemo(
        () => functionService.values(),
        [functionService, functionStore]
    )

    const mappedSuggestions: Suggestion[] = suggestions.map((suggestion) => {

        if (suggestion.__typename === "NodeFunction") {
            const functionDefinition = functions.find(f => f.id === suggestion.functionDefinition?.id)
            const module = modules.find(m => m.id === functionDefinition?.runtimeModule?.id)

            return {
                value: suggestion,
                icon: functionDefinition?.displayIcon,
                displayMessage: functionDefinition?.names?.[0].content,
                aliases: functionDefinition?.aliases?.[0].content?.split(";"),
                definitionSource: module?.id,
                description: functionDefinition?.descriptions?.[0].content,
            }
        }

        return null
    }).filter((Boolean)) as Suggestion[]

    const groupedByModule = new Map<string, { suggestions: Suggestion[], module: any }>()

    mappedSuggestions.forEach((suggestion) => {
        const moduleId = suggestion.definitionSource
        const module = modules.find(m => m.id === moduleId)

        if (!groupedByModule.has(moduleId)) {
            groupedByModule.set(moduleId, {
                suggestions: [],
                module: module
            })
        }

        groupedByModule.get(moduleId)!.suggestions.push(suggestion)
    })

    return [
        {
            suggestions: mappedSuggestions,
            displayMessage: "All",
            icon: undefined
        },
        ...Array.from(groupedByModule.values()).map((group) => ({
            suggestions: group.suggestions,
            displayMessage: group.module?.names?.[0].content,
            icon: group.module?.icon
        }))
    ]
}