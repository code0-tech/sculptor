import {Flow, NodeFunction} from "@code0-tech/sagittarius-graphql-types";
import {
    FunctionSuggestion,
    FunctionSuggestionType
} from "@edition/function/components/suggestion/FunctionSuggestionComponent.view";
import {useService, useStore} from "@code0-tech/pictor";
import {FunctionService} from "@edition/function/services/Function.service";
import {DatatypeService} from "@edition/datatype/services/Datatype.service";
import {FlowService} from "@edition/flow/services/Flow.service";
import React, {startTransition} from "react";

export const useReferenceSuggestions = (
    flowId: Flow['id'],
    nodeId?: NodeFunction['id'],
    parameterIndex?: number,
): FunctionSuggestion[] => {

    const workerRef = React.useRef<Worker>(null);
    const [suggestions, setSuggestions] = React.useState<any[]>([])

    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)
    const functionStore = useStore(FunctionService)
    const functionService = useService(FunctionService)
    const dataTypeStore = useStore(DatatypeService)
    const dataTypeService = useService(DatatypeService)

    const flow = React.useMemo(
        () => flowService.getById(flowId),
        [flowId, flowStore]
    )
    const functions = React.useMemo(() => functionService.values(), [functionStore]);
    const dataTypes = React.useMemo(() => dataTypeService.values(), [dataTypeStore]);

    React.useEffect(() => {
        console.log("Reference suggestion worker init")
        const currentWorker = new Worker(new URL("./FunctionReferenceSuggestions.worker.ts", import.meta.url));
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
        console.log("Requesting reference suggestions for node", nodeId, "parameter", parameterIndex)
        if (!workerRef.current || typeof parameterIndex != "number" || !flow) return;

        const timeout = setTimeout(() => {
            workerRef.current?.postMessage({
                flow,
                nodeId,
                parameterIndex,
                functions,
                dataTypes
            });
        }, 100);

        return () => clearTimeout(timeout);
    }, [flow, nodeId, parameterIndex, functions, dataTypes])

    return React.useMemo(() => suggestions.map(suggestion => {

        return {
            path: [],
            type: FunctionSuggestionType.REF_OBJECT,
            displayText: [`${suggestion.referencePath?.map((path: any) => path.path).join(".") ?? ""}`],
            value: suggestion,
        }
    }), [suggestions]);
}
