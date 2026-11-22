import {Flow, NodeParameterValue} from "@code0-tech/sagittarius-graphql-types";

export const referenceTargetIdsOfValue = (value: NodeParameterValue | null | undefined, flowId: Flow["id"]): string[] => {
    if (!value) return []

    if (value.__typename === "ReferenceValue") {
        const nodeFunctionId: string | null | undefined = value.nodeFunctionId
        return [!nodeFunctionId || nodeFunctionId === "undefined" ? flowId as string : nodeFunctionId]
    }

    if (value.__typename === "LiteralValue")
        return (value.references ?? []).flatMap(reference => referenceTargetIdsOfValue(reference?.value, flowId))

    if (value.__typename === "SubFlowValue")
        return (value.parameters ?? []).flatMap(parameter => referenceTargetIdsOfValue(parameter?.value, flowId))

    return []
}
