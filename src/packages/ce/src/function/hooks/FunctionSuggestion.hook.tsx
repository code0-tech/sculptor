import React, {startTransition} from "react";
import type {Flow, NodeFunction} from "@code0-tech/sagittarius-graphql-types";
import {useValueSuggestions} from "./FunctionValueSuggestions.hook";
import {useReferenceSuggestions} from "./FunctionReferenceSuggestions.hook";
import {useNodeSuggestions} from "./FunctionNodeSuggestions.hook";
import {useService, useStore} from "@code0-tech/pictor";
import {FunctionSuggestion} from "@edition/function/components/suggestion/FunctionSuggestionComponent.view";
import {FunctionService} from "@edition/function/services/Function.service";
import {FlowService} from "@edition/flow/services/Flow.service";
import {DatatypeService} from "@edition/datatype/services/Datatype.service";

//TODO: deep type search
//TODO: calculate FUNCTION_COMBINATION deepness max 2

export const useSuggestions = (
    flowId: Flow['id'],
    nodeId?: NodeFunction['id'],
    parameterIndex?: number
): FunctionSuggestion[] => {

    console.log("useSuggestions", {flowId, nodeId, parameterIndex})

    const [types, setTypes] = React.useState<any>(null);
    const workerRef = React.useRef<Worker>(null);

    const functionService = useService(FunctionService)
    const functionStore = useStore(FunctionService)
    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)
    const dataTypeStore = useStore(DatatypeService)
    const dataTypeService = useService(DatatypeService)

    const node = React.useMemo(
        () => flowService.getNodeById(flowId, nodeId),
        [flowId, flowStore, nodeId]
    )

    const functions = React.useMemo(() => functionService.values(), [functionStore]);
    const dataTypes = React.useMemo(() => dataTypeService.values(), [dataTypeStore]);

    React.useEffect(() => {
        console.log("FunctionSuggestion worker init")
        const currentWorker = new Worker(new URL("./FunctionTypesFromNode.worker.ts", import.meta.url));
        workerRef.current = currentWorker;

        currentWorker.onmessage = (event) => {
            startTransition(() => {
                setTypes(event.data);
            })
        }

        return () => {
            currentWorker.terminate();
        };
    }, [])

    React.useEffect(() => {
        console.log("Requesting suggestions for node", nodeId, "parameter", parameterIndex)
        if (!workerRef.current || !node) return;

        const timeout = setTimeout(() => {
            workerRef.current?.postMessage({
                node,
                functions,
                dataTypes
            });
        }, 100);

        return () => clearTimeout(timeout);
    }, [node, functions, dataTypes])

    const valueSuggestions = useValueSuggestions(types?.parameters?.[parameterIndex ?? 0])
    const refObjectSuggestions = useReferenceSuggestions(flowId, nodeId, parameterIndex)
    const functionSuggestions = useNodeSuggestions(types?.parameters?.[parameterIndex ?? 0])

    return React.useMemo(() => {
        return [
            ...valueSuggestions,
            ...refObjectSuggestions,
            ...functionSuggestions
        ].sort()
    }, [flowId, nodeId, parameterIndex, refObjectSuggestions, functionSuggestions, types])
}
