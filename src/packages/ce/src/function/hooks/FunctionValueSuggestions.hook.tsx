import {
    FunctionSuggestion,
    FunctionSuggestionType
} from "@edition/function/components/suggestion/FunctionSuggestionComponent.view";
import {getValueSuggestions} from "@code0-tech/triangulum";

export const useValueSuggestions = (
    type?: string
): FunctionSuggestion[] => {

    if (!type) return []

    const suggestions = getValueSuggestions(type)

    return suggestions.map(suggestion => {

        return {
            path: [],
            type: FunctionSuggestionType.VALUE,
            displayText: [suggestion.value as string],
            value: suggestion,
        }
    })
}
