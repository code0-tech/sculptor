import {Flow} from "@code0-tech/sagittarius-graphql-types";
import React from "react";
import {useService, useStore} from "@code0-tech/pictor";
import {FlowService} from "@edition/flow/services/Flow.service";

export const useReferencedNodeIds = (flowId: Flow["id"]): Set<string> => {

    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)

    const flow = React.useMemo(
        () => flowService.getById(flowId),
        [flowStore, flowId]
    )

    return React.useMemo(() => {
        const ids = new Set<string>()

        const targetNodeId = (nodeFunctionId?: string | null) =>
            !nodeFunctionId || nodeFunctionId === "undefined" ? flowId as string : nodeFunctionId

        flow?.nodes?.nodes?.forEach(node => {
            node?.parameters?.nodes?.forEach(parameter => {
                const value = parameter?.value
                if (!value) return

                if (value.__typename === "ReferenceValue") {
                    ids.add(targetNodeId(value.nodeFunctionId))
                } else if (value.__typename === "LiteralValue") {
                    (value.references ?? []).forEach(reference => {
                        if (reference?.value?.__typename === "ReferenceValue") {
                            ids.add(targetNodeId(reference.value.nodeFunctionId))
                        }
                    })
                }
            })
        })

        return ids
    }, [flow, flow?.editedAt, flowStore, flowId])
}
