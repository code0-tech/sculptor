import {ListInput, NodeSchema} from "@code0-tech/triangulum";
import {FunctionDefinition, NodeFunction} from "@code0-tech/sagittarius-graphql-types";
import {parameterNodeSuggestions} from "@edition/flow/utils/Flow.parameterNodeSuggestions.util";
import {hasParameterValue} from "@edition/flow/utils/Flow.parameterValue.util";

export interface SubFlowParameter {
    index: number
    addable: boolean
    empty: boolean
    // without own suggestions the parameter can only be filled from the function catalogue, which makes a
    // sub flow - so the slot has to sit where that group will be, along the flow instead of beside it
    alongFlow: boolean
}

export const subFlowParameters = (schema: NodeSchema[], node?: NodeFunction, definition?: FunctionDefinition): SubFlowParameter[] =>
    (definition?.parameterDefinitions?.nodes ?? []).flatMap((parameterDefinition, index) => {
        if (parameterDefinition?.hidden || parameterDefinition?.removedAt) return []

        const input = schema[index]?.schema?.input

        const value = node?.parameters?.nodes?.[index]?.value

        const alongFlow = parameterNodeSuggestions(schema[index]).length === 0

        // a sub flow with its own starting node is drawn as a group, it does not hang on a port
        const entries = value?.__typename === "LiteralValue" ? (value.references ?? []).length : value ? 1 : 0

        // a sub flow value only counts as filled while something is actually drawn for it: a group when it
        // has a starting node, a round node when it names a function. any other value leaves the parameter
        // with neither a node nor a slot, and the user has no way left to fill it
        const filled = value?.__typename === "SubFlowValue"
            ? !!value.startingNodeId || !!value.functionDefinition?.id
            : hasParameterValue(value)

        if (input === "sub-flow") return value?.__typename === "SubFlowValue" && value.startingNodeId
            ? []
            : [{index, addable: !filled, empty: !filled, alongFlow}]
        if (input === "list-sub-flow") return [{index, addable: true, empty: entries === 0, alongFlow}]
        if (input === "list" && ((schema[index]?.schema as ListInput | undefined)?.declaredItems ?? [])
            .some(item => item.input === "sub-flow")) return [{index, addable: true, empty: entries === 0, alongFlow}]

        return []
    })
