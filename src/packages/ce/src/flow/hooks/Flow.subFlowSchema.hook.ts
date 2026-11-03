import type {Flow, NodeFunction} from "@code0-tech/sagittarius-graphql-types";
import {useService, useStore} from "@code0-tech/pictor";
import React from "react";
import {NodeSchema} from "@code0-tech/triangulum";
import {FlowService} from "@edition/flow/services/Flow.service";
import {useSubFlowSchemaAction} from "@edition/flow/components/FlowWorkerProvider";

export const useSubFlowSchema = (
    flowId: Flow['id'],
    nodeId: NodeFunction['id'],
    parameterIndex: number,
    referenceSignature?: string,
): NodeSchema[] => {
    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)
    const {execute, hydrated} = useSubFlowSchemaAction()

    const [schema, setSchema] = React.useState<NodeSchema[]>([])

    const flow = React.useMemo(
        () => flowService.getById(flowId),
        [flowId, flowService, flowStore]
    )

    React.useEffect(() => {
        if (!flow) return
        if (!hydrated) return

        let cancelled = false

        execute({flow, nodeId, parameterIndex, referenceSignature}).then(resolved => {
            if (cancelled) return
            setSchema(resolved?.parameters ?? [])
        })

        return () => {
            cancelled = true
        }
    }, [flow, flow?.editedAt, hydrated, execute, nodeId, parameterIndex, referenceSignature])

    return schema
}
