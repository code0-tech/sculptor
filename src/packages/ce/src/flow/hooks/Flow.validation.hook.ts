import React from "react"
import type {Flow} from "@code0-tech/sagittarius-graphql-types"
import {useService, useStore} from "@code0-tech/pictor";
import {FunctionService} from "@edition/function/services/Function.service";
import {FlowService} from "@edition/flow/services/Flow.service";
import {DatatypeService} from "@edition/datatype/services/Datatype.service";
import {ValidationResult} from "@core/util/inspection";
import {useFlowValidationAction} from "@edition/flow/components/FlowWorkerProvider";

const globalPendingValidations = new Map<string, Promise<ValidationResult[]>>()

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

        const timeout = setTimeout(() => {
            const key = flowId as string;

            if (globalPendingValidations.has(key)) {
                globalPendingValidations.get(key)!.then(value => {
                    setValidationResult(value as ValidationResult[])
                });
                return;
            }

            const promise = execute({
                flow,
                functions,
                dataTypes
            }).then(value => {
                setValidationResult(value as ValidationResult[])
                globalPendingValidations.delete(key);
                return value;
            });

            globalPendingValidations.set(key, promise as Promise<ValidationResult[]>);
        }, 200);

        return () => clearTimeout(timeout);
    }, [flow?.editedAt, functions.length, dataTypes.length])

    return validationResult
}