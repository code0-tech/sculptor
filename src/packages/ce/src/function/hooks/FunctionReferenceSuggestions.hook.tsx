import {Flow, NodeFunction} from "@code0-tech/sagittarius-graphql-types";
import {
    FunctionSuggestion,
    FunctionSuggestionType
} from "@edition/function/components/suggestion/FunctionSuggestionComponent.view";
import {useService, useStore} from "@code0-tech/pictor";
import {FunctionService} from "@edition/function/services/Function.service";
import {DatatypeService} from "@edition/datatype/services/Datatype.service";
import {getReferenceSuggestions} from "@code0-tech/triangulum";
import {FlowService} from "@edition/flow/services/Flow.service";
import React from "react";

export const useReferenceSuggestions = (
    flowId: Flow['id'],
    nodeId?: NodeFunction['id'],
    type?: string
): FunctionSuggestion[] => {

    const flowService = useService(FlowService)
    const functionStore = useStore(FunctionService)
    const dataTypeStore = useStore(DatatypeService)

    const flow = React.useMemo(
        () => flowService.getById(flowId),
        [flowId, flowService]
    )

    if (!type || !flow) return []

    const suggestions = getReferenceSuggestions(flow, nodeId, type, functionStore, dataTypeStore)

    return suggestions.map(suggestion => {

        return {
            path: [],
            type: FunctionSuggestionType.REF_OBJECT,
            displayText: [`${suggestion.referencePath?.map(path => path.path).join(".") ?? ""}`],
            value: suggestion,
        }
    })
}
