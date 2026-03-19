import React from "react"
import type {Flow} from "@code0-tech/sagittarius-graphql-types"
import {useService, useStore} from "@code0-tech/pictor";
import {FunctionService} from "@edition/function/services/Function.service";
import {FlowService} from "@edition/flow/services/Flow.service";
import {DatatypeService} from "@edition/datatype/services/Datatype.service";
import {ValidationResult} from "@core/util/inspection";

declare global {
    interface Window {
        lastValidatedFlows?: Record<string, { lastValidated: string, validation: ValidationResult[] }>;
    }
}

export const useFlowValidation = (
    flowId: Flow['id']
): ValidationResult[] | null => {

    const workerRef = React.useRef<Worker>(null);

    const functionStore = useStore(FunctionService)
    const functionService = useService(FunctionService)
    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)
    const dataTypeStore = useStore(DatatypeService)
    const dataTypeService = useService(DatatypeService)

    const [validationResult, setValidationResult] = React.useState<ValidationResult[] | null>(null)

    const flow = React.useMemo(
        () => flowService.getById(flowId),
        [flowStore, flowId, flowService]
    )

    const functions = React.useMemo(() => functionService.values(), [functionStore]);
    const dataTypes = React.useMemo(() => dataTypeService.values(), [dataTypeStore]);

    React.useEffect(() => {
        const currentWorker = new Worker(new URL("./Flow.validation.worker.ts", import.meta.url));
        workerRef.current = currentWorker;

        currentWorker.onmessage = (event: MessageEvent<ValidationResult[]>) => {
            if (flow) {
                window.lastValidatedFlows = {
                    ...window.lastValidatedFlows,
                    [flowId as string]: {
                        lastValidated: flow.editedAt!,
                        validation: event.data
                    }
                }
            }
            setValidationResult(event.data);
        }

        return () => {
            currentWorker.terminate();
        };
    }, [flowId, flow?.id]) // Re-create worker only if flow changes fundamentally

    React.useEffect(() => {
        if (!flow || !workerRef.current) return;

        // Skip if already validated for this version
        if (window.lastValidatedFlows?.[flowId as string]?.lastValidated === flow.editedAt) {
            setValidationResult(window.lastValidatedFlows?.[flowId as string].validation!)
            return;
        }

        const timeout = setTimeout(() => {
            workerRef.current?.postMessage({
                flow,
                functions,
                dataTypes
            });
        }, 300); // Increased debounce to reduce load

        return () => clearTimeout(timeout);
    }, [flow, functions, dataTypes, flowId, flowStore])

    return validationResult
}