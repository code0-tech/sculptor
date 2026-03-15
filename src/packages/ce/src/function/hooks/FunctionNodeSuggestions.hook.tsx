import {
    FunctionSuggestion,
    FunctionSuggestionType
} from "@edition/function/components/suggestion/FunctionSuggestionComponent.view";
import {getNodeSuggestions} from "@code0-tech/triangulum";
import {useService, useStore} from "@code0-tech/pictor";
import {FunctionService} from "@edition/function/services/Function.service";
import {DatatypeService} from "@edition/datatype/services/Datatype.service";

export const useNodeSuggestions = (
    type?: string,
): FunctionSuggestion[] => {

    const functionStore = useStore(FunctionService)
    const functionService = useService(FunctionService)
    const dataTypeStore = useStore(DatatypeService)

    if (!type) return []

    const suggestions = getNodeSuggestions(type, functionStore, dataTypeStore)

    return suggestions.map(suggestion => {

        const functionDefinition = functionService.getById(suggestion.functionDefinition?.id)

        return {
            path: [],
            type: FunctionSuggestionType.FUNCTION,
            displayText: [functionDefinition?.names![0]?.content as string],
            value: suggestion,
        }
    })
}
