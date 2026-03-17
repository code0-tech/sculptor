import React from "react"
import type {Flow, NodeFunction} from "@code0-tech/sagittarius-graphql-types"
import {useService, useStore} from "@code0-tech/pictor";
import {FunctionService} from "@edition/function/services/Function.service";
import {FlowService} from "@edition/flow/services/Flow.service";
import {DatatypeService} from "@edition/datatype/services/Datatype.service";
import {InspectionSeverity, ValidationResult} from "@core/util/inspection";
import {getFlowValidation} from "@code0-tech/triangulum";

const errorResult = (
    nodeId: NodeFunction['id'],
    parameterIndex: number,
    message: string
): ValidationResult => ({
    nodeId: nodeId,
    parameterIndex: parameterIndex,
    type: InspectionSeverity.ERROR,
    message: [{
        code: "en-US",
        content: message
    }]
})

export const useFlowValidation = (
    flowId: Flow['id']
): ValidationResult[] | null => {

    const functionStore = useStore(FunctionService)
    const functionService = useService(FunctionService)
    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)
    const dataTypeStore = useStore(DatatypeService)
    const dataTypeService = useService(DatatypeService)

    const flow = flowService.getById(flowId)

    return React.useMemo(() => {
        const validation = getFlowValidation(flow!, functionService.values(), dataTypeService.values())
        return validation.diagnostics.map(diagnostic => errorResult(diagnostic.nodeId, diagnostic.parameterIndex!, diagnostic.message))
    }, [flow, flowStore])
}