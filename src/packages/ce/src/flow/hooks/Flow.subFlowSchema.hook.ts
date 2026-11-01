import type {Flow, NodeFunction} from "@code0-tech/sagittarius-graphql-types";
import {useService, useStore} from "@code0-tech/pictor";
import React from "react";
import {NodeSchema} from "@code0-tech/triangulum";
import {FlowService} from "@edition/flow/services/Flow.service";
import {DatatypeService} from "@edition/datatype/services/Datatype.service";
import {FunctionService} from "@edition/function/services/Function.service";
import {useSubFlowSchemaAction} from "@edition/flow/components/FlowWorkerProvider";

export const useSubFlowSchema = (
    flowId: Flow['id'],
    nodeId: NodeFunction['id'],
    parameterIndex: number,
    referenceSignature?: string,
): NodeSchema[] => {
    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)
    const dataTypeService = useService(DatatypeService)
    const dataTypeStore = useStore(DatatypeService)
    const functionService = useService(FunctionService)
    const functionStore = useStore(FunctionService)
    const {execute} = useSubFlowSchemaAction()

    const [schema, setSchema] = React.useState<NodeSchema[]>([])

    const flow = React.useMemo(
        () => flowService.getById(flowId),
        [flowId, flowService, flowStore]
    )

    const dataTypes = React.useMemo(
        () => dataTypeService.values(),
        [dataTypeStore, dataTypeService]
    )

    const functions = React.useMemo(
        () => functionService.values(),
        [functionStore, functionService]
    )

    React.useEffect(() => {
        if (!flow) return
        if (dataTypes.length <= 0) return
        if (functions.length <= 0) return

        let cancelled = false

        execute({flow, dataTypes, functions, nodeId, parameterIndex, referenceSignature}).then(resolved => {
            if (cancelled) return
            setSchema(resolved?.parameters ?? [])
        })

        return () => {
            cancelled = true
        }
    }, [functions.length, dataTypes.length, flow?.editedAt, nodeId, parameterIndex, referenceSignature])

    return schema
}
