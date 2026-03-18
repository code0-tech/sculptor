import {
    FunctionSuggestion,
    FunctionSuggestionType
} from "@edition/function/components/suggestion/FunctionSuggestionComponent.view";
import {getValueSuggestions} from "@code0-tech/triangulum";
import {useService, useStore} from "@code0-tech/pictor";
import {DatatypeService} from "@edition/datatype/services/Datatype.service";

export const useValueSuggestions = (
    type?: string
): FunctionSuggestion[] => {

    const dataTypeStore = useStore(DatatypeService)
    const dataTypeService = useService(DatatypeService)

    if (!type) return []

    const suggestions = getValueSuggestions(type, dataTypeService.values())

    return suggestions.map(suggestion => {

        return {
            path: [],
            type: FunctionSuggestionType.VALUE,
            displayText: [suggestion.value as string],
            value: suggestion,
        }
    })
}
