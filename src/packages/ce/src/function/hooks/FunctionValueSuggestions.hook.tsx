import {
    FunctionSuggestion,
    FunctionSuggestionType
} from "@edition/function/components/suggestion/FunctionSuggestionComponent.view";
import {useService, useStore} from "@code0-tech/pictor";
import {DatatypeService} from "@edition/datatype/services/Datatype.service";
import React, {startTransition} from "react";

export const useValueSuggestions = (
    type?: string
): FunctionSuggestion[] => {


    const dataTypeStore = useStore(DatatypeService)
    const dataTypeService = useService(DatatypeService)

    const workerRef = React.useRef<Worker>(null);
    const [suggestions, setSuggestions] = React.useState<any[]>([])
    const isFirstRun = React.useRef(true);
    const dataTypes = React.useMemo(() => dataTypeService.values(), [dataTypeStore]);

    React.useEffect(() => {
        console.log("Value suggestion worker init")
        const currentWorker = new Worker(new URL("./FunctionValueSuggestions.worker.ts", import.meta.url));
        workerRef.current = currentWorker;

        currentWorker.onmessage = (event) => {
            startTransition(() => {
                setSuggestions(event.data);
            })
        }

        return () => {
            currentWorker.terminate();
        };
    }, [])

    React.useEffect(() => {
        console.log("Requesting value suggestions for type", type)
        if (!type || !workerRef.current) {
            setSuggestions([])
            return;
        }

        const timeout = setTimeout(() => {
            workerRef.current?.postMessage({
                type,
                dataTypes
            });
        }, isFirstRun.current ? 0 : 500);

        isFirstRun.current = false

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
