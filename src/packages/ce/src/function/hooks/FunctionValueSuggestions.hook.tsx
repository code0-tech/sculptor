import {
    FunctionSuggestion,
    FunctionSuggestionType
} from "@edition/function/components/suggestion/FunctionSuggestionComponent.view";
import {useService, useStore} from "@code0-tech/pictor";
import {DatatypeService} from "@edition/datatype/services/Datatype.service";
import React, {startTransition} from "react";
import {useValueSuggestionsAction} from "@edition/flow/components/FlowWorkerProvider";

export const useValueSuggestions = (
    type?: string
): FunctionSuggestion[] => {

    const dataTypeStore = useStore(DatatypeService)
    const dataTypeService = useService(DatatypeService)

    const {execute} = useValueSuggestionsAction()
    const [suggestions, setSuggestions] = React.useState<any[]>([])

    const dataTypes = React.useMemo(() => dataTypeService.values(), [dataTypeStore]);

    React.useEffect(() => {
        console.log("Requesting value suggestions for type", type)
        if (!type) {
            setSuggestions([])
            return;
        }

        const timeout = setTimeout(() => {
            execute({
                type,
                dataTypes
            }).then(value => {
                startTransition(() => {
                    setSuggestions(value as any[])
                })
            })
        }, 200);

        return () => clearTimeout(timeout);
    }, [type, dataTypes])

    return React.useMemo(() => suggestions.map(suggestion => {

        return {
            path: [],
            type: FunctionSuggestionType.VALUE,
            displayText: [suggestion.value as string],
            value: suggestion,
        }
    }), [suggestions]);
}
