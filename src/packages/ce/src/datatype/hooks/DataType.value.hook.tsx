import type {Flow, LiteralValue, NodeFunction} from "@code0-tech/sagittarius-graphql-types";
import {useService, useStore} from "@code0-tech/pictor";
import {FlowService} from "@edition/flow/services/Flow.service";
import {useNodeTypeExtractionAction, useValueExtractionAction} from "@edition/flow/components/FlowWorkerProvider";
import React from "react";

export const useValue = (
    flowId: Flow['id'],
    nodeId?: NodeFunction['id'],
    parameterIndex?: number
): LiteralValue | null => {


    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)

    const typeAction = useNodeTypeExtractionAction()
    const valueAction = useValueExtractionAction()
    const [types, setTypes] = React.useState<any>(null);
    const [value, setValue] = React.useState<any>(null);

    const node = React.useMemo(
        () => flowService.getNodeById(flowId, nodeId),
        [flowId, flowStore, nodeId]
    )

    React.useEffect(() => {
        const timeout = setTimeout(() => {
            typeAction.execute({
                node: node!
            }).then(value => {
                setTypes(value)
            })
        }, 200);

        return () => clearTimeout(timeout);
    }, [node, flowStore, typeAction.hydrated])

    React.useEffect(() => {

        const timeout = setTimeout(() => {
            valueAction.execute({
                type: types?.parameters?.[parameterIndex ?? 0]
            }).then(value => {
                setValue(value)
            })
        }, 200);

        return () => clearTimeout(timeout);

    }, [types, parameterIndex, valueAction.hydrated])

    return value
}