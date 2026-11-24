import {Flow, LiteralValue, NodeFunction, ReferenceValue, SubFlowValue} from "@code0-tech/sagittarius-graphql-types";
import {FlowService} from "@edition/flow/services/Flow.service";

// where a picked suggestion came from, which is what decides how it becomes a value:
// "parameter" are triangulum's own suggestions for this parameter - triangulum vouches that the return
// value of a NodeFunction (or the whole function behind a SubFlowValue) fits, so the node goes into the
// flow before the host and the parameter points at it.
// "catalogue" is the function list sculptor generates itself. nothing says those fit the parameter, so
// they may only be used as a node to run - they become the starting node of the parameter's sub flow.
export type SuggestionOrigin = "parameter" | "catalogue"

export interface ParameterSuggestionValue {
    value: SubFlowValue | ReferenceValue
    addedNodeId?: NodeFunction['id']
}

export const parameterValueOfSuggestion = (
    flowService: FlowService,
    flowId: Flow['id'],
    nodeId: NodeFunction['id'] | null,
    suggestion: SubFlowValue | ReferenceValue | NodeFunction | LiteralValue,
    origin: SuggestionOrigin
): ParameterSuggestionValue | undefined => {

    if (suggestion.__typename === "SubFlowValue" || suggestion.__typename === "ReferenceValue") {
        return {value: suggestion}
    }

    if (suggestion.__typename !== "NodeFunction") return undefined

    if (origin === "catalogue") {
        const startingNodeId = flowService.addNodeById(flowId, suggestion)
        if (!startingNodeId) return undefined
        return {value: {__typename: "SubFlowValue", startingNodeId}, addedNodeId: startingNodeId}
    }

    const addedNodeId = flowService.addPreviousNodeById(flowId, nodeId, suggestion)
    if (!addedNodeId) return undefined
    return {value: {__typename: "ReferenceValue", nodeFunctionId: addedNodeId}, addedNodeId}
}
