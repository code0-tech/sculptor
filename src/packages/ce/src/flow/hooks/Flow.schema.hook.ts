import type {Flow, Namespace, NamespaceProject} from "@code0-tech/sagittarius-graphql-types";
import {useService, useStore} from "@code0-tech/pictor";
import {FlowService} from "@edition/flow/services/Flow.service";
import React from "react";
import {useFlowSchemasAction} from "@edition/flow/components/FlowWorkerProvider";
import {SignatureSchema} from "@code0-tech/triangulum";

const globalPendingSchemas = new Map<string, Promise<SignatureSchema[] | undefined>>()

export const useFlowSchema = (
    flowId: Flow['id'],
    namespaceId: Namespace['id'],
    projectId: NamespaceProject['id'],
): SignatureSchema[] | undefined => {
    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)
    const {execute, hydrated} = useFlowSchemasAction()

    const [schema, setSchema] = React.useState<SignatureSchema[] | undefined>([]);

    const flow = React.useMemo(
        () => flowService.getById(flowId, {namespaceId, projectId}),
        [flowId, namespaceId, projectId, flowService, flowStore]
    )

    React.useEffect(() => {
        if (!flow) return
        if (!hydrated) return

        const key = `${flowId}-${flow.editedAt}-${flow.nodes?.nodes?.length}`
        const pending = globalPendingSchemas.get(key) ?? execute({flow})

        globalPendingSchemas.set(key, pending)

        let cancelled = false

        pending.then(value => {
            globalPendingSchemas.delete(key)
            if (cancelled) return
            setSchema(value)
        })

        return () => {
            cancelled = true
        }
    }, [flow, flow?.editedAt, flow?.nodes?.nodes?.length, flowId, hydrated, execute])

    return schema
}
