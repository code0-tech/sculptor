import type {Flow, Namespace, NamespaceProject} from "@code0-tech/sagittarius-graphql-types";
import {useService, useStore} from "@code0-tech/pictor";
import {FlowService} from "@edition/flow/services/Flow.service";
import React from "react";
import {useSchemaAction} from "@edition/flow/components/FlowWorkerProvider";
import {DatatypeService} from "@edition/datatype/services/Datatype.service";
import {FunctionService} from "@edition/function/services/Function.service";
import {NodeSchema} from "@code0-tech/triangulum";

export const useFlowSchema = (
    flowId: Flow['id'],
    namespaceId: Namespace['id'],
    projectId: NamespaceProject['id'],
): NodeSchema[][] | undefined => {
    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)
    const dataTypeStore = useStore(DatatypeService)
    const dataTypeService = useService(DatatypeService)
    const functionService = useService(FunctionService)
    const functionStore = useStore(FunctionService)
    const {execute} = useSchemaAction()

    const [schema, setSchema] = React.useState<NodeSchema[][] | undefined>([]);

    const flow = React.useMemo(
        () => flowService.getById(flowId, {namespaceId, projectId}),
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

        const triggerSchema = execute({
            flow,
            dataTypes,
            functions
        })

        const schemas = flow.nodes?.nodes?.map(node => {
            return execute({
                flow,
                dataTypes,
                functions,
                nodeId: node?.id
            })
        })

        Promise.all([triggerSchema!, ...schemas!]).then((value) => {
            setSchema(value as NodeSchema[][])
        })

    }, [functions, dataTypes, flow])

    return schema
}
