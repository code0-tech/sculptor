import {ListInput, NodeSchema} from "@code0-tech/triangulum";
import {FunctionDefinition, NodeFunction} from "@code0-tech/sagittarius-graphql-types";

export const subFlowSlotIndexes = (schema: NodeSchema[], node: NodeFunction, definition?: FunctionDefinition): number[] =>
    (definition?.parameterDefinitions?.nodes ?? []).flatMap((parameterDefinition, index) => {
        if (parameterDefinition?.hidden) return []

        const input = schema[index]?.schema?.input

        if (input === "sub-flow") return node.parameters?.nodes?.[index]?.value ? [] : [index]
        if (input === "list-sub-flow") return [index]
        if (input === "list" && ((schema[index]?.schema as ListInput | undefined)?.declaredItems ?? [])
            .some(item => item.input === "sub-flow")) return [index]

        return []
    })
