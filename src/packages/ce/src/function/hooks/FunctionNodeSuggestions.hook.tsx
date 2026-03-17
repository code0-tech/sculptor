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
    const dataTypeService = useService(DatatypeService)

    const suggestions = getNodeSuggestions(type, functionService.values(), dataTypeService.values())

    return suggestions.sort((a, b) => {
        const [rA, pA, fA] = a?.functionDefinition!!.identifier!!.split("::");
        const [rB, pB, fB] = b?.functionDefinition!!.identifier!!.split("::");

        const runtimeCmp = rA.localeCompare(rB);
        if (runtimeCmp !== 0) return runtimeCmp;

        const packageCmp = pA.localeCompare(pB);
        if (packageCmp !== 0) return packageCmp;

        return fA.localeCompare(fB);
    }).map(suggestion => {

        const functionDefinition = functionService.getById(suggestion.functionDefinition?.id)

        return {
            path: [],
            type: FunctionSuggestionType.FUNCTION,
            displayText: [functionDefinition?.names![0]?.content as string],
            value: suggestion,
        }
    })
}
