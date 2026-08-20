import {
    DefinitionDataType,
    FlowSetting,
    FlowType,
    FlowTypeSetting,
    FlowTypeSetting_UniquenessScope,
    FunctionDefinition,
    Module,
    ModuleConfigurationDefinition,
    ModuleDefinition,
    NodeFunction,
    NodeParameter,
    NodeValue,
    ParameterDefinition,
    Translation,
    ValidationFlow,
    Value
} from "@code0-tech/tucana/shared"

const TIMESTAMP = "2026-01-01T00:00:00Z"
const RUNTIME_ID = "gid://sagittarius/Runtime/1"
const PROJECT_ID = "gid://sagittarius/NamespaceProject/undefined"
const NAMESPACE_ID = "gid://sagittarius/Namespace/undefined"

export const project = {
    __typename: "NamespaceProject",
    id: PROJECT_ID,
    slug: "playground",
    namespace: {__typename: "Namespace", id: NAMESPACE_ID},
    primaryRuntime: {__typename: "Runtime", id: RUNTIME_ID}
}

type JsonValue = string | number | boolean | null | JsonValue[] | {[key: string]: JsonValue}

const gid = (type: string, id: number | bigint) => `gid://sagittarius/${type}/${id}`

const translations = (list: Translation[] = []) =>
    list.map(({code, content}) => ({__typename: "Translation", code, content}))

const plainValue = (value?: Value): JsonValue => {
    const kind = value?.kind
    if (!kind || kind.oneofKind === undefined) return null
    switch (kind.oneofKind) {
        case "stringValue":
            return kind.stringValue
        case "boolValue":
            return kind.boolValue
        case "nullValue":
            return null
        case "numberValue": {
            const number = kind.numberValue.number
            if (number.oneofKind === "integer") return Number(number.integer)
            if (number.oneofKind === "float") return number.float
            return null
        }
        case "structValue":
            return Object.fromEntries(Object.entries(kind.structValue.fields).map(([key, entry]) => [key, plainValue(entry)]))
        case "listValue":
            return kind.listValue.values.map(plainValue)
        default:
            return null
    }
}

const literalValue = (value?: Value) => ({__typename: "LiteralValue", value: plainValue(value)})

const mapDataType = (dataType: DefinitionDataType, id: string, runtimeModuleId: string) => ({
    __typename: "DataType",
    id,
    identifier: dataType.identifier,
    type: dataType.type,
    genericKeys: dataType.genericKeys,
    definitionSource: dataType.definitionSource,
    version: dataType.version,
    createdAt: TIMESTAMP,
    updatedAt: TIMESTAMP,
    name: translations(dataType.name),
    aliases: translations(dataType.alias),
    displayMessages: translations(dataType.displayMessage),
    runtime: {id: RUNTIME_ID},
    runtimeModule: {__typename: "RuntimeModule", id: runtimeModuleId},
    rules: {__typename: "DataTypeRuleConnection", count: 0, nodes: [], pageInfo: {endCursor: null, hasNextPage: false}}
})

const mapParameterDefinition = (parameter: ParameterDefinition, id: string) => ({
    __typename: "ParameterDefinition",
    id,
    identifier: parameter.runtimeName,
    defaultValue: parameter.defaultValue ? literalValue(parameter.defaultValue) : null,
    optional: parameter.optional ?? false,
    hidden: parameter.hidden ?? false,
    createdAt: TIMESTAMP,
    updatedAt: TIMESTAMP,
    names: translations(parameter.name),
    descriptions: translations(parameter.description),
    documentations: translations(parameter.documentation)
})

const mapFunction = (fn: FunctionDefinition, id: string, runtimeFunctionId: string, runtimeModuleId: string, moduleIdentifier: string, parameterNodes: unknown[]) => ({
    __typename: "FunctionDefinition",
    id,
    identifier: fn.runtimeName,
    signature: fn.signature,
    displayIcon: fn.displayIcon,
    createdAt: TIMESTAMP,
    updatedAt: TIMESTAMP,
    names: translations(fn.name),
    descriptions: translations(fn.description),
    displayMessages: translations(fn.displayMessage),
    documentations: translations(fn.documentation),
    aliases: translations(fn.alias),
    deprecationMessages: translations(fn.deprecationMessage),
    runtime: {id: RUNTIME_ID},
    runtimeModule: {__typename: "RuntimeModule", id: runtimeModuleId, identifier: moduleIdentifier},
    runtimeFunctionDefinition: {
        __typename: "RuntimeFunctionDefinition",
        id: runtimeFunctionId,
        identifier: fn.runtimeDefinitionName,
        definitionSource: fn.definitionSource,
        version: fn.version,
        runtime: {id: RUNTIME_ID}
    },
    parameterDefinitions: {nodes: parameterNodes}
})

const mapFlowTypeSetting = (setting: FlowTypeSetting, id: string) => ({
    __typename: "FlowTypeSetting",
    id,
    identifier: setting.identifier,
    unique: setting.unique === FlowTypeSetting_UniquenessScope.PROJECT,
    optional: setting.optional ?? false,
    hidden: setting.hidden ?? false,
    defaultValue: setting.defaultValue ? literalValue(setting.defaultValue) : null,
    createdAt: TIMESTAMP,
    updatedAt: TIMESTAMP,
    names: translations(setting.name),
    descriptions: translations(setting.description)
})

const mapFlowType = (flowType: FlowType, id: string, runtimeFlowTypeId: string, runtimeModuleId: string, settingNodes: unknown[]) => ({
    __typename: "FlowType",
    id,
    identifier: flowType.identifier,
    signature: flowType.signature,
    displayIcon: flowType.displayIcon,
    editable: flowType.editable,
    definitionSource: flowType.definitionSource,
    version: flowType.version,
    createdAt: TIMESTAMP,
    updatedAt: TIMESTAMP,
    names: translations(flowType.name),
    descriptions: translations(flowType.description),
    displayMessages: translations(flowType.displayMessage),
    aliases: translations(flowType.alias),
    runtime: {id: RUNTIME_ID},
    runtimeModule: {__typename: "RuntimeModule", id: runtimeModuleId},
    runtimeFlowType: {
        __typename: "RuntimeFlowType",
        id: runtimeFlowTypeId,
        runtimeModule: {__typename: "RuntimeModule", id: runtimeModuleId}
    },
    flowTypeSettings: {
        __typename: "FlowTypeSettingConnection",
        count: settingNodes.length,
        nodes: settingNodes,
        pageInfo: {endCursor: null, hasNextPage: false}
    }
})

const mapNodeValue = (value?: NodeValue) => {
    const inner = value?.value
    if (inner?.oneofKind === "literalValue") return literalValue(inner.literalValue.value)
    return null
}

const mapNodeParameter = (parameter: NodeParameter, functionRuntimeId: string, parameterId: Map<string, string>) => ({
    __typename: "NodeParameter",
    id: gid("NodeParameter", parameter.databaseId),
    createdAt: TIMESTAMP,
    updatedAt: TIMESTAMP,
    parameterDefinition: {
        __typename: "ParameterDefinition",
        id: parameterId.get(`${functionRuntimeId}::${parameter.runtimeParameterId}`) ?? null,
        identifier: parameter.runtimeParameterId,
        createdAt: TIMESTAMP,
        updatedAt: TIMESTAMP
    },
    value: mapNodeValue(parameter.value)
})

const mapNodeFunction = (node: NodeFunction, functionId: Map<string, string>, parameterId: Map<string, string>) => {
    const parameterNodes = node.parameters.map(parameter => mapNodeParameter(parameter, node.runtimeFunctionId, parameterId))
    return {
        __typename: "NodeFunction",
        id: gid("NodeFunction", node.databaseId ?? 0),
        nextNodeId: node.nextNodeId != null ? gid("NodeFunction", node.nextNodeId) : null,
        createdAt: TIMESTAMP,
        updatedAt: TIMESTAMP,
        functionDefinition: {
            __typename: "FunctionDefinition",
            id: functionId.get(node.runtimeFunctionId) ?? null,
            identifier: node.runtimeFunctionId
        },
        parameters: {
            __typename: "NodeParameterConnection",
            count: parameterNodes.length,
            nodes: parameterNodes,
            pageInfo: {endCursor: null, hasNextPage: false}
        }
    }
}

const mapFlowSetting = (setting: FlowSetting) => ({
    __typename: "FlowSetting",
    id: gid("FlowSetting", setting.databaseId ?? 0),
    flowSettingIdentifier: setting.flowSettingId,
    value: plainValue(setting.value),
    createdAt: TIMESTAMP,
    updatedAt: TIMESTAMP
})

const mapFlow = (flow: ValidationFlow, flowTypeId: Map<string, string>, functionId: Map<string, string>, parameterId: Map<string, string>) => {
    const nodeNodes = flow.nodeFunctions.map(node => mapNodeFunction(node, functionId, parameterId))
    const settingNodes = flow.settings.map(mapFlowSetting)
    return {
        __typename: "Flow",
        id: gid("Flow", flow.flowId),
        name: flow.name,
        signature: flow.signature,
        startingNodeId: gid("NodeFunction", flow.startingNodeId),
        createdAt: TIMESTAMP,
        updatedAt: TIMESTAMP,
        editedAt: TIMESTAMP,
        validationStatus: "VALID",
        disabledReason: flow.disableReason ?? null,
        type: {__typename: "FlowType", id: flowTypeId.get(flow.type) ?? null},
        project: {__typename: "NamespaceProject", id: PROJECT_ID, namespace: {__typename: "Namespace", id: NAMESPACE_ID}},
        userAbilities: {deleteFlow: false},
        nodes: {
            __typename: "NodeFunctionConnection",
            count: nodeNodes.length,
            nodes: nodeNodes,
            pageInfo: {endCursor: null, hasNextPage: false}
        },
        settings: {
            __typename: "FlowSettingConnection",
            count: settingNodes.length,
            nodes: settingNodes,
            pageInfo: {endCursor: null, hasNextPage: false}
        },
        executionResults: {
            __typename: "ExecutionResultConnection",
            count: 0,
            nodes: [],
            pageInfo: {endCursor: null, hasNextPage: false}
        }
    }
}

const runtimeModuleId = (modules: Module[], module: Module) => gid("RuntimeModule", modules.indexOf(module) + 1)

const mapModuleDefinition = (definition: ModuleDefinition, id: string) => {
    const endpoint = definition.value.oneofKind === "endpoint" ? definition.value.endpoint : undefined
    return {
        __typename: "RuntimeModuleDefinition",
        id,
        createdAt: TIMESTAMP,
        updatedAt: TIMESTAMP,
        endpoint: endpoint?.endpoint ?? null,
        host: endpoint?.host ?? null,
        port: endpoint ? Number(endpoint.port) : null,
        protocol: endpoint?.protocol ?? null
    }
}

const mapModuleConfiguration = (configuration: ModuleConfigurationDefinition, id: string, runtimeModuleId: string) => ({
    __typename: "ModuleConfigurationDefinition",
    id,
    createdAt: TIMESTAMP,
    updatedAt: TIMESTAMP,
    identifier: configuration.identifier,
    defaultValue: configuration.defaultValue ? literalValue(configuration.defaultValue) : null,
    type: configuration.type,
    hidden: configuration.hidden ?? false,
    optional: configuration.optional ?? false,
    runtimeModule: {__typename: "RuntimeModule", id: runtimeModuleId},
    names: translations(configuration.name),
    descriptions: translations(configuration.description)
})

const mapModule = (module: Module, id: string, definitionNodes: unknown[], configurationNodes: unknown[]) => ({
    __typename: "RuntimeModule",
    id,
    createdAt: TIMESTAMP,
    updatedAt: TIMESTAMP,
    identifier: module.identifier,
    version: module.version,
    author: module.author,
    documentation: module.documentation,
    icon: module.icon,
    names: translations(module.name),
    descriptions: translations(module.description),
    runtime: {id: RUNTIME_ID},
    flowTypes: {count: (module.flowTypes ?? []).length},
    functionDefinitions: {count: (module.functionDefinitions ?? []).length},
    definitions: {
        __typename: "RuntimeModuleDefinitionConnection",
        count: definitionNodes.length,
        nodes: definitionNodes,
        pageInfo: {endCursor: null, hasNextPage: false}
    },
    configurationDefinitions: {
        __typename: "ModuleConfigurationDefinitionConnection",
        count: configurationNodes.length,
        nodes: configurationNodes,
        pageInfo: {endCursor: null, hasNextPage: false}
    }
})

export const mapModules = (modules: Module[]) => {
    const definitionEntries = modules.flatMap(module => (module.definitions ?? []).map(definition => ({definition, module})))
    const definitionNodes = definitionEntries.map(({definition, module}, index) => ({module, node: mapModuleDefinition(definition, gid("RuntimeModuleDefinition", index + 1))}))
    const configurationEntries = modules.flatMap(module => (module.configurations ?? []).map(configuration => ({configuration, module})))
    const configurationNodes = configurationEntries.map(({configuration, module}, index) => ({module, node: mapModuleConfiguration(configuration, gid("ModuleConfigurationDefinition", index + 1), runtimeModuleId(modules, module))}))
    return modules.map(module => mapModule(
        module,
        runtimeModuleId(modules, module),
        definitionNodes.filter(entry => entry.module === module).map(entry => entry.node),
        configurationNodes.filter(entry => entry.module === module).map(entry => entry.node)
    ))
}

export const mapDatatypes = (modules: Module[]) => {
    const dataTypeEntries = modules.flatMap(module => (module.definitionDataTypes ?? []).map(dataType => ({dataType, module})))
    return dataTypeEntries.map(({dataType, module}, index) => mapDataType(dataType, gid("DataType", index + 1), runtimeModuleId(modules, module)))
}

export const mapFunctions = (modules: Module[]) => {
    const functionEntries = modules.flatMap(module => (module.functionDefinitions ?? []).map(fn => ({fn, module})))
    const parameterEntries = functionEntries.flatMap(({fn}) => (fn.parameterDefinitions ?? []).map(parameter => ({fn, parameter})))
    const parameterNodes = parameterEntries.map(({fn, parameter}, index) => ({fn, node: mapParameterDefinition(parameter, gid("ParameterDefinition", index + 1))}))
    return functionEntries.map(({fn, module}, index) => mapFunction(
        fn,
        gid("FunctionDefinition", index + 1),
        gid("RuntimeFunctionDefinition", index + 1),
        runtimeModuleId(modules, module),
        module.identifier,
        parameterNodes.filter(entry => entry.fn === fn).map(entry => entry.node)
    ))
}

export const mapFlowtypes = (modules: Module[]) => {
    const flowTypeEntries = modules.flatMap(module => (module.flowTypes ?? []).map(flowType => ({flowType, module})))
    const settingNodes = flowTypeEntries
        .flatMap(({flowType}) => (flowType.settings ?? []).map(setting => ({flowType, setting})))
        .map(({flowType, setting}, index) => ({flowType, node: mapFlowTypeSetting(setting, gid("FlowTypeSetting", index + 1))}))
    return flowTypeEntries.map(({flowType, module}, index) => mapFlowType(
        flowType,
        gid("FlowType", index + 1),
        gid("RuntimeFlowType", index + 1),
        runtimeModuleId(modules, module),
        settingNodes.filter(entry => entry.flowType === flowType).map(entry => entry.node)
    ))
}

export const mapFlows = (modules: Module[], flows: ValidationFlow[]) => {
    const functionEntries = modules.flatMap(module => (module.functionDefinitions ?? []).map(fn => ({fn, module})))
    const functionId = new Map(functionEntries.map(({fn}, index) => [fn.runtimeName, gid("FunctionDefinition", index + 1)]))
    const parameterEntries = functionEntries.flatMap(({fn}) => (fn.parameterDefinitions ?? []).map(parameter => ({fn, parameter})))
    const parameterId = new Map(parameterEntries.map(({fn, parameter}, index) => [`${fn.runtimeName}::${parameter.runtimeName}`, gid("ParameterDefinition", index + 1)]))
    const flowTypeEntries = modules.flatMap(module => (module.flowTypes ?? []).map(flowType => ({flowType, module})))
    const flowTypeId = new Map(flowTypeEntries.map(({flowType}, index) => [flowType.identifier, gid("FlowType", index + 1)]))
    return flows.map(flow => mapFlow(flow, flowTypeId, functionId, parameterId))
}
