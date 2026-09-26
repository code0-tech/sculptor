import {
    Flow,
    FlowInput,
    FlowSettingInput,
    FlowType,
    FunctionDefinition,
    NodeFunction,
    NodeFunctionInput,
    NodeParameterInput,
    NodeParameterValueInput
} from "@code0-tech/sagittarius-graphql-types"

export type FlowTemplateJsonValue =
    string | number | boolean | null | FlowTemplateJsonValue[] | { [key: string]: FlowTemplateJsonValue }

export interface FlowTemplatePath {
    path: string | null
    arrayIndex: number | null
}

export type FlowTemplateValue =
    | { kind: "literal", value: FlowTemplateJsonValue, references: { signature: string, value: FlowTemplateValue }[] }
    | { kind: "reference", nodeId: number | null, parameterIndex: number | null, inputIndex: number | null, path: FlowTemplatePath[] }
    | { kind: "subFlow", startingNodeId: number | null, functionIdentifier: string | null, signature: string }

export interface FlowTemplateParameter {
    identifier: string
    cast: string | null
    value: FlowTemplateValue | null
}

export interface FlowTemplateNode {
    id: number
    nextId: number | null
    functionIdentifier: string
    parameters: FlowTemplateParameter[]
}

export interface FlowTemplateSetting {
    identifier: string
    cast: string | null
    value: FlowTemplateJsonValue
}

export interface FlowTemplate {
    slug: string
    name: string
    description: string
    flowTypeIdentifier: string
    signature: string
    startingNodeId: number
    nodes: FlowTemplateNode[]
    settings: FlowTemplateSetting[]
}

export interface FlowTemplateSettingAdjustment {
    name: string
    from: string
    to: string
}

export interface FlowTemplateInput {
    input: FlowInput
    adjustments: FlowTemplateSettingAdjustment[]
}

export interface FlowTemplateResolution {
    template: FlowTemplate
    flowType?: FlowType
    definitions: Map<string, FunctionDefinition>
    missingFunctions: string[]
    missingParameters: string[]
    available: boolean
}


const nodeFunctionId = (id: number): NonNullable<NodeFunction['id']> => `gid://sagittarius/NodeFunction/${id}`

const mapValue = (value: FlowTemplateValue | null): NodeParameterValueInput => {
    if (!value) return {literalValue: null}

    if (value.kind === "reference") return {
        referenceValue: {
            ...(value.nodeId !== null ? {nodeFunctionId: nodeFunctionId(value.nodeId)} : {}),
            ...(value.parameterIndex !== null ? {parameterIndex: value.parameterIndex} : {}),
            ...(value.inputIndex !== null ? {inputIndex: value.inputIndex} : {}),
            referencePath: value.path.map(path => ({path: path.path, arrayIndex: path.arrayIndex}))
        }
    }

    if (value.kind === "subFlow") return {
        subFlowValue: {
            ...(value.startingNodeId !== null
                ? {startingNodeId: nodeFunctionId(value.startingNodeId)}
                : value.functionIdentifier ? {functionIdentifier: value.functionIdentifier} : {}),
            signature: value.signature,
            settings: []
        }
    }

    if (value.references.length > 0) return {
        literalValue: {
            value: value.value,
            references: value.references.map(reference => ({
                signature: reference.signature,
                value: mapValue(reference.value)
            }))
        }
    }

    return {literalValue: {value: value.value}}
}

export const resolveFlowTemplate = (template: FlowTemplate, flowTypes: FlowType[], functions: FunctionDefinition[]): FlowTemplateResolution => {

    const flowType = flowTypes.find(candidate => candidate.identifier === template.flowTypeIdentifier)
    const definitions = new Map<string, FunctionDefinition>()
    const missingFunctions: string[] = []
    const missingParameters: string[] = []

    template.nodes.forEach(node => {
        if (definitions.has(node.functionIdentifier) || missingFunctions.includes(node.functionIdentifier)) return
        const definition = functions.find(candidate => candidate.identifier === node.functionIdentifier)
        if (definition) definitions.set(node.functionIdentifier, definition)
        else missingFunctions.push(node.functionIdentifier)
    })

    template.nodes.forEach(node => {
        const definition = definitions.get(node.functionIdentifier)
        if (!definition) return
        const identifiers = (definition.parameterDefinitions?.nodes ?? []).map(parameter => parameter?.identifier)
        node.parameters.forEach(parameter => {
            const missing = `${node.functionIdentifier}.${parameter.identifier}`
            if (parameter.value && !identifiers.includes(parameter.identifier) && !missingParameters.includes(missing)) {
                missingParameters.push(missing)
            }
        })
    })

    return {
        template,
        flowType,
        definitions,
        missingFunctions,
        missingParameters,
        available: !!flowType && missingFunctions.length <= 0 && missingParameters.length <= 0
    }
}

export const buildFlowTemplateInput = (resolution: FlowTemplateResolution, name: string, flows: Flow[]): FlowTemplateInput | undefined => {

    const {template, flowType, definitions} = resolution
    if (!flowType) return undefined

    const adjustments: FlowTemplateSettingAdjustment[] = []
    const siblings = flows.filter(flow => flow.type?.id === flowType.id)

    const settings: FlowSettingInput[] = (flowType.flowTypeSettings?.nodes ?? []).map((flowTypeSetting, index) => {
        const setting = template.settings.find(candidate => candidate.identifier === flowTypeSetting?.identifier)
        if (!setting) return {value: flowTypeSetting?.defaultValue ?? null}

        const cast = setting.cast ? {cast: setting.cast} : {}
        // RuntimeFlowTypeSettingUnique is an ambient const enum and unusable under isolatedModules,
        // so the scope is compared as the string the enum resolves to.
        const unique = (flowTypeSetting?.unique as string | undefined) === "PROJECT"
        if (!unique || typeof setting.value !== "string") return {...cast, value: setting.value}

        const taken = siblings.map(flow => flow.settings?.nodes?.[index]?.value)
        let value = setting.value
        let suffix = 2
        while (taken.includes(value)) value = `${setting.value}-${suffix++}`
        if (value !== setting.value) {
            adjustments.push({
                name: flowTypeSetting?.names?.[0]?.content ?? flowTypeSetting!.identifier!,
                from: setting.value,
                to: value
            })
        }

        return {...cast, value}
    })

    const nodes: NodeFunctionInput[] = template.nodes.map(node => {
        const definition = definitions.get(node.functionIdentifier)!
        return {
            id: nodeFunctionId(node.id),
            ...(node.nextId !== null ? {nextNodeId: nodeFunctionId(node.nextId)} : {}),
            functionDefinitionId: definition.id!,
            parameters: (definition.parameterDefinitions?.nodes ?? []).map<NodeParameterInput>(parameterDefinition => {
                const parameter = node.parameters.find(candidate => candidate.identifier === parameterDefinition?.identifier)
                return {
                    ...(parameter?.cast ? {cast: parameter.cast} : {}),
                    value: mapValue(parameter?.value ?? null)
                }
            })
        }
    })

    return {
        input: {
            name,
            type: flowType.id!,
            signature: template.signature,
            startingNodeId: nodeFunctionId(template.startingNodeId),
            settings,
            nodes
        },
        adjustments
    }
}
