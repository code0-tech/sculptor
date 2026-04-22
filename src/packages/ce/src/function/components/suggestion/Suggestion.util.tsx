import {LiteralValue, NodeFunction, ReferenceValue} from "@code0-tech/sagittarius-graphql-types";
import {FunctionSuggestion} from "@edition/function/components/suggestion/FunctionSuggestionComponent.view";
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

export const getMappedSuggestions = (suggestions: FunctionSuggestion[]): SuggestionGroup[] => {

    const mappedSuggestions: Suggestion[] = suggestions.map((suggestion) => {
        return {
            value: suggestion.value,
            icon: suggestion.icon,
            displayMessage: suggestion.displayText.join(" "),
            aliases: suggestion.aliases || [],
            definitionSource: suggestion.definitionSource || "All",
            description: suggestion.description,
        }
    })

    const groupedBySource = mappedSuggestions.reduce((acc, suggestion) => {
        const source = suggestion.definitionSource
        const runtimeIdentifier = suggestion.value.__typename === "NodeFunction"
            ? suggestion.value.functionDefinition?.identifier
            : undefined

        if (!acc[source]) {
            acc[source] = []
        }

        if (runtimeIdentifier) {
            const [_, pkg] = runtimeIdentifier.split("::")
            const identifier = `${pkg[0].toUpperCase()}${pkg.slice(1)}`
            if (!acc[identifier]) {
                acc[identifier] = []
            }
            acc[identifier].push(suggestion)
        }

        acc[source].push(suggestion)
        return acc
    }, {} as Record<string, Suggestion[]>)


    return Object.entries(groupedBySource).map(([source, suggestions]) => ({
        suggestions,
        displayMessage: source,
        icon: source === "All" ? "" : suggestions[0]?.icon,
    }))
}