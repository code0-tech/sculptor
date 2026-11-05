import React from "react"
import type {Flow} from "@code0-tech/sagittarius-graphql-types"
import {useService, useStore} from "@code0-tech/pictor";
import {FlowService} from "@edition/flow/services/Flow.service";
import {ValidationResult} from "@core/util/inspection";
import {useFlowValidationAction} from "@edition/flow/components/FlowWorkerProvider";

const globalPendingValidations = new Map<string, Promise<ValidationResult[]>>()

//TODO: use context
export const useFlowValidation = (
    flowId: Flow['id']
): ValidationResult[] | null => {

    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)

    const {execute, hydrated} = useFlowValidationAction()
    const [validationResult, setValidationResult] = React.useState<ValidationResult[] | null>(null)

    const flow = React.useMemo(
        () => flowService.getById(flowId),
        [flowStore, flowId]
    )

    React.useEffect(() => {
        if (!flow) return;
        if (!hydrated) return;
        const key = flowId as string;

        if (globalPendingValidations.has(key)) {
            globalPendingValidations.get(key)!.then(value => {
                setValidationResult(value as ValidationResult[])
            });
            return;
        }

        const timeout = setTimeout(() => {

            const promise = execute({flow}).then(value => {
                setValidationResult(value as ValidationResult[])
                globalPendingValidations.delete(key);
                return value;
            });

            globalPendingValidations.set(key, promise as Promise<ValidationResult[]>);
        }, 200);

        return () => clearTimeout(timeout);
    }, [flow, flow?.editedAt, hydrated, execute, flowId])

    return React.useMemo(() => validationResult, [validationResult])
}