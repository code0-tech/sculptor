import {
    AiGenerationFlow,
    AiGenerationLiteralValue,
    AiGenerationNodeValue,
    AiGenerationReferenceValue,
    AiGenerationSubFlowValue,
    FlowInput,
    FlowSettingInput,
    NodeFunctionInput,
    NodeParameterInput,
    NodeParameterValueInput,
} from "@code0-tech/sagittarius-graphql-types"

const FALLBACK_FLOW_NAME = "Untitled flow"

const mapValue = (value?: AiGenerationNodeValue | null): NodeParameterValueInput => {
    switch (value?.__typename) {
        case "AiGenerationLiteralValue": {
            const literal = value as AiGenerationLiteralValue
            return {
                literalValue: {
                    value: literal.value ?? null,
                    ...((literal.references?.length ?? 0) > 0 ? {
                        references: literal.references!.map(reference => ({
                            signature: reference.signature ?? "",
                            value: mapValue(reference.value),
                        })),
                    } : {}),
                },
            }
        }
        case "AiGenerationReferenceValue": {
            const v = value as AiGenerationReferenceValue
            return {
                referenceValue: {
                    ...(v.nodeFunctionId ? {nodeFunctionId: v.nodeFunctionId} : {}),
                    ...(v.parameterIndex != null ? {parameterIndex: v.parameterIndex} : {}),
                    ...(v.inputIndex != null ? {inputIndex: v.inputIndex} : {}),
                    ...(v.inputTypeIdentifier ? {inputTypeIdentifier: v.inputTypeIdentifier} : {}),
                    referencePath: v.referencePath?.map(p => ({
                        path: p.path,
                        arrayIndex: p.arrayIndex,
                    })) ?? [],
                },
            }
        }
        case "AiGenerationSubFlowValue": {
            const v = value as AiGenerationSubFlowValue
            return {
                subFlowValue: {
                    ...(v.startingNodeId
                        ? {startingNodeId: v.startingNodeId}
                        : v.functionDefinition?.identifier
                            ? {functionIdentifier: v.functionDefinition.identifier}
                            : {}),
                    signature: v.signature ?? "",
                    ...(v.name ? {name: v.name} : {}),
                    ...(v.description ? {description: v.description} : {}),
                    parameters: (v.parameters ?? [])
                        .filter(parameter => !!parameter.identifier && !!parameter.value)
                        .map(parameter => ({
                            identifier: parameter.identifier!,
                            ...(parameter.cast ? {cast: parameter.cast} : {}),
                            value: mapValue(parameter.value),
                        })),
                },
            }
        }
        default:
            return {literalValue: null}
    }
}

export const ensureUniqueFlowName = (name: string, existingNames: string[]): string => {
    if (!existingNames.includes(name)) return name
    let i = 2
    while (existingNames.includes(`${name} v${i}`)) i++
    return `${name} v${i}`
}

export const mapAiGenerationFlowToFlowInput = (
    aiFlow: AiGenerationFlow,
    options?: { existingNames?: string[] }
): FlowInput | undefined => {
    if (!aiFlow.type?.id) return undefined

    const baseName = aiFlow.name?.trim() ? aiFlow.name.trim() : FALLBACK_FLOW_NAME
    const name = ensureUniqueFlowName(baseName, options?.existingNames ?? [])

    const settings: FlowSettingInput[] = (aiFlow.settings ?? []).map(s => ({
        cast: s?.cast ?? undefined,
        value: s?.value,
    }))

    const nodes: NodeFunctionInput[] = (aiFlow.nodes ?? []).map(node => ({
        id: node?.id!,
        nextNodeId: node?.nextNodeId ?? undefined,
        functionDefinitionId: node?.functionDefinition?.id!,
        parameters: (node?.parameters ?? []).map<NodeParameterInput>(p => ({
            cast: p?.cast ?? undefined,
            value: mapValue(p?.value),
        })),
    }))

    return {
        name,
        type: aiFlow.type.id,
        startingNodeId: aiFlow.startingNodeId ?? undefined,
        settings,
        nodes,
    }
}
