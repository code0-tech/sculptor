import React, {startTransition} from "react"
import type {Flow} from "@code0-tech/sagittarius-graphql-types"
import {useService, useStore} from "@code0-tech/pictor";
import {FunctionService} from "@edition/function/services/Function.service";
import {FlowService} from "@edition/flow/services/Flow.service";
import {DatatypeService} from "@edition/datatype/services/Datatype.service";
import {ValidationResult} from "@core/util/inspection";
import {useFlowValidationAction} from "@edition/flow/components/FlowWorkerProvider";

declare global {
    interface Window {
        lastValidatedFlows?: Record<string, { lastValidated: string, validation: ValidationResult[] }>;
    }
}

export const useFlowValidation = (
    flowId: Flow['id']
): ValidationResult[] | null => {

    const functionStore = useStore(FunctionService)
    const functionService = useService(FunctionService)
    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)
    const dataTypeStore = useStore(DatatypeService)
    const dataTypeService = useService(DatatypeService)

    const {execute} = useFlowValidationAction()
    const [validationResult, setValidationResult] = React.useState<ValidationResult[] | null>(null)

    const flow = React.useMemo(
        () => flowService.getById(flowId),
        [flowStore, flowId, flowService]
    )

    const functions = React.useMemo(() => functionService.values(), [functionStore]);
    const dataTypes = React.useMemo(() => dataTypeService.values(), [dataTypeStore]);

    React.useEffect(() => {
        if (!flow) return;

        // Skip if already validated for this version
        if (window.lastValidatedFlows?.[flowId as string]?.lastValidated === flow.editedAt) {
            setValidationResult(window.lastValidatedFlows?.[flowId as string].validation!)
            return;
        }

        const timeout = setTimeout(() => {
            execute({
                flow,
                functions,
                dataTypes
            }).then(value => {
                startTransition(() => {
                    setValidationResult(value as ValidationResult[])
                    window.lastValidatedFlows = {
                        ...window.lastValidatedFlows,
                        [flowId as string]: {
                            lastValidated: flow.editedAt!,
                            validation: value as ValidationResult[]
                        }
                    }
                })
            });
        }, 200);

        return () => clearTimeout(timeout);
    }, [flow, functions, dataTypes, flowStore])

    return validationResult
}