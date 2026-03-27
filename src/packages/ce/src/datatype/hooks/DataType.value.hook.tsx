import type {Flow, LiteralValue, NodeFunction} from "@code0-tech/sagittarius-graphql-types";
import {useService, useStore} from "@code0-tech/pictor";
import {FunctionService} from "@edition/function/services/Function.service";
import {FlowService} from "@edition/flow/services/Flow.service";
import {DatatypeService} from "@edition/datatype/services/Datatype.service";
import {useTypeExtractionAction, useValueExtractionAction} from "@edition/flow/components/FlowWorkerProvider";
import React, {startTransition} from "react";

export const useValue = (
    flowId: Flow['id'],
    nodeId?: NodeFunction['id'],
    parameterIndex?: number
): LiteralValue | null => {


    const functionService = useService(FunctionService)
    const functionStore = useStore(FunctionService)
    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)
    const dataTypeStore = useStore(DatatypeService)
    const dataTypeService = useService(DatatypeService)

    const typeAction = useTypeExtractionAction()
    const valueAction = useValueExtractionAction()
    const [types, setTypes] = React.useState<any>(null);
    const [value, setValue] = React.useState<any>(null);

    const node = React.useMemo(
        () => flowService.getNodeById(flowId, nodeId),
        [flowId, flowStore, nodeId]
    )

    const functions = React.useMemo(
        () => functionService.values(),
        [functionStore]
    )

    const dataTypes = React.useMemo(
        () => dataTypeService.values(),
        [dataTypeStore]
    )

    React.useEffect(() => {
        const timeout = setTimeout(() => {
            typeAction.execute({
                node: node!,
                dataTypes: dataTypes,
                functions: functions
            }).then(value => {
                startTransition(() => {
                    setTypes(value)
                })
            })
        }, 200);

        return () => clearTimeout(timeout);
    }, [...(node?.parameters?.nodes?.map(p => p?.value) ?? []), functions, dataTypes])

    React.useEffect(() => {

        const timeout = setTimeout(() => {
            valueAction.execute({
                type: types?.parameters?.[parameterIndex ?? 0],
                dataTypes: dataTypes
            }).then(value => {
                startTransition(() => {
                    setValue(value)
                })
            })
        }, 200);

        return () => clearTimeout(timeout);

    }, [types, dataTypes])

    return value
}