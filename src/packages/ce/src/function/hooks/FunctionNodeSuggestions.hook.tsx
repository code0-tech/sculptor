import {
    FunctionSuggestion,
    FunctionSuggestionType
} from "@edition/function/components/suggestion/FunctionSuggestionComponent.view";
import {useService, useStore} from "@code0-tech/pictor";
import {FunctionService} from "@edition/function/services/Function.service";
import {DatatypeService} from "@edition/datatype/services/Datatype.service";
import React, {startTransition} from "react";
import {useNodeSuggestionsAction} from "@edition/flow/components/FlowWorkerProvider";
import {icon, IconString} from "@core/util/icons";
import {FALLBACK_FUNCTION_NAME} from "@core/util/fallback-translations";

export const useNodeSuggestions = (
    type?: string,
): FunctionSuggestion[] => {

    const functionStore = useStore(FunctionService)
    const functionService = useService(FunctionService)
    const dataTypeStore = useStore(DatatypeService)
    const dataTypeService = useService(DatatypeService)

    const [suggestions, setSuggestions] = React.useState<any[]>([])
    const {execute} = useNodeSuggestionsAction()

    const functions = React.useMemo(() => functionService.values(), [functionStore]);
    const dataTypes = React.useMemo(() => dataTypeService.values(), [dataTypeStore]);

    React.useEffect(() => {

        const timeout = setTimeout(() => {
            execute({
                type: type as string,
                functions,
                dataTypes
            }).then(value => {
                startTransition(() => {
                    setSuggestions(value as any[])
                })
            })
        }, 200);

        return () => clearTimeout(timeout);
    }, [type, functions, dataTypes])

    return React.useMemo(() => suggestions.sort((a, b) => {
        const [rA, pA, fA] = a?.functionDefinition!!.identifier!!.split("::");
        const [rB, pB, fB] = b?.functionDefinition!!.identifier!!.split("::");

        const runtimeCmp = rA.localeCompare(rB);
        if (runtimeCmp !== 0) return runtimeCmp;

        const packageCmp = pA.localeCompare(pB);
        if (packageCmp !== 0) return packageCmp;

        return fA.localeCompare(fB);
    }).map(suggestion => {

        const functionDefinition = functionService.getById(suggestion.functionDefinition?.id)
        const DisplayIcon = icon(functionDefinition?.displayIcon as IconString)
        return {
            path: [],
            type: FunctionSuggestionType.FUNCTION,
            displayText: [functionDefinition?.names?.[0]?.content ?? FALLBACK_FUNCTION_NAME],
            value: suggestion,
            icon: <DisplayIcon color="#70ffb2" size={16}/>
        }
    }), [suggestions]);
}
