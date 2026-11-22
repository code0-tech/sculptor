import {ListInput, NodeSchema} from "@code0-tech/triangulum";
import {FunctionDefinition, NodeFunction} from "@code0-tech/sagittarius-graphql-types";

export interface SubFlowParameter {
    index: number
    addable: boolean
    empty: boolean
}

export const subFlowParameters = (schema: NodeSchema[], node?: NodeFunction, definition?: FunctionDefinition): SubFlowParameter[] =>
    (definition?.parameterDefinitions?.nodes ?? []).flatMap((parameterDefinition, index) => {
        if (parameterDefinition?.hidden) return []

        const input = schema[index]?.schema?.input

        const value = node?.parameters?.nodes?.[index]?.value

        // a sub flow with its own starting node is drawn as a group, it does not hang on a port
        const entries = value?.__typename === "LiteralValue" ? (value.references ?? []).length : value ? 1 : 0

        if (input === "sub-flow") return value?.__typename === "SubFlowValue" && value.startingNodeId
            ? []
            : [{index, addable: !value, empty: !value}]
        if (input === "list-sub-flow") return [{index, addable: true, empty: entries === 0}]
        if (input === "list" && ((schema[index]?.schema as ListInput | undefined)?.declaredItems ?? [])
            .some(item => item.input === "sub-flow")) return [{index, addable: true, empty: entries === 0}]

        return []
    })
