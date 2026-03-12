import React from "react"
import type {
    Flow,
    NodeFunction,
    NodeParameter,
    NodeParameterValue,
    ReferenceValue
} from "@code0-tech/sagittarius-graphql-types"
import {useDataTypeValidation} from "./DataTypeValidation.hook"
import {useValueValidation} from "./ValueValidation.hook"
import {DataTypeView} from "@edition/datatype/services/DataType.view";
import {
    GenericMap,
    replaceGenericKeysInDataTypeObject,
    replaceGenericKeysInType,
    resolveGenericKeys
} from "@edition/flow/utils/generics";
import {
    useService,
    useStore
} from "@code0-tech/pictor";
import {useReturnType} from "@edition/function/hooks/Function.return.hook";
import {getReferenceType} from "@edition/function/hooks/FunctionNodeReference.return.hook";
import {FunctionService} from "@edition/function/services/Function.service";
import {FlowService} from "@edition/flow/services/Flow.service";
import {FlowTypeService} from "@edition/flowtype/services/FlowType.service";
import {DatatypeService} from "@edition/datatype/services/Datatype.service";
import {InspectionSeverity, ValidationResult} from "@core/util/inspection";

const isReference = (value: NodeParameterValue) =>
    value.__typename === "ReferenceValue"

const isNode = (value: NodeParameterValue) =>
    value.__typename === "NodeFunctionIdWrapper"

const resolveDataTypeWithGenerics = (
    dataType: DataTypeView,
    genericMap: GenericMap
) =>
    new DataTypeView(
        replaceGenericKeysInDataTypeObject(dataType.json!, genericMap)
    )

const errorResult = (
    parameterIndex: number,
    expected?: DataTypeView,
    actual?: DataTypeView
): ValidationResult => ({
    parameterIndex: parameterIndex,
    type: InspectionSeverity.ERROR,
    message: [{
        code: "en-US",
        content: `Argument of type ${actual?.name!![0]?.content} is not assignable to parameter of type ${expected?.name!![0]?.content}`
    }]
})

export const useNodeValidation = (
    nodeId: NodeFunction['id'],
    flowId: Flow['id']
): ValidationResult[] | null => {

    const functionService = useService(FunctionService)
    const functionStore = useStore(FunctionService)
    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)
    const flowTypeService = useService(FlowTypeService)
    const flowTypeStore = useStore(FlowTypeService)
    const dataTypeService = useService(DatatypeService)
    const dataTypeStore = useStore(DatatypeService)

    const flow = flowService.getById(flowId)
    const node = flowService.getNodeById(flowId, nodeId)
    const values = node?.parameters?.nodes?.map(p => p?.value!!) ?? []
    const functionDefinition = functionService.getById(node?.functionDefinition?.id)
    const parameters = functionDefinition?.parameterDefinitions ?? []
    const genericKeys = functionDefinition?.genericKeys ?? []
    const genericMap = React.useMemo(
        () => resolveGenericKeys(functionDefinition!, values, dataTypeService, functionService, flow),
        [functionDefinition, values, dataTypeService, dataTypeStore, flow, flowStore]
    )

    const resolveValueType = React.useCallback(
        (value: NodeParameterValue, expectedDT?: DataTypeView) => {

            //TODO seperate check for flow input, return type and parameter type to properly resolve variables
            if ((isNode(value) && expectedDT?.variant !== "NODE")) {
                const node = flowService.getNodeById(flowId, value.__typename == "NodeFunctionIdWrapper" ? value.id : value.__typename === "ReferenceValue" ? value.nodeFunctionId : undefined)
                const fn = functionService.getById(node?.functionDefinition?.id!!)!!
                const params = node?.parameters?.nodes?.map(p => p?.value!!) ?? []
                return useReturnType(fn, params, dataTypeService, functionService)
            } else if (isReference(value)) {
                const node = flowService.getNodeById(flowId, value.__typename == "NodeFunctionIdWrapper" ? value.id : value.__typename === "ReferenceValue" ? value.nodeFunctionId : undefined)
                const fn = functionService.getById(node?.functionDefinition?.id!!)!!
                const flowType = flowTypeService.getById(flow?.type?.id)?.json()
                return getReferenceType(value as ReferenceValue, dataTypeService, functionService, fn, node, flowType)
            }
            return dataTypeService.getTypeFromValue(value, flow)
        },
        [dataTypeService, flow, flowId, flowService, functionService, flowTypeStore]
    )

    return React.useMemo(() => {
        const errors: ValidationResult[] = []

        for (let i = 0; i < parameters.length; i++) {
            const parameter = parameters[i]
            const value = values[i]
            if (!value) continue

            const expectedType = parameter.dataTypeIdentifier
            const expectedResolvedType = replaceGenericKeysInType(expectedType!, genericMap)
            const expectedDT = dataTypeService.getDataType(expectedResolvedType)
            const valueType = resolveValueType(value, expectedDT)
            const valueDT = dataTypeService.getDataType(valueType!!)

            if (!expectedDT || !valueDT) {
                errors.push(errorResult(i, expectedDT, valueDT))
                continue
            }

            const isGeneric =
                !!expectedType?.genericType ||
                (!!expectedType?.genericKey && genericKeys.includes(expectedType.genericKey))

            let isValid = true

            if (isGeneric) {
                const resolvedExpectedDT = resolveDataTypeWithGenerics(expectedDT, genericMap)
                if (isReference(value) || (isNode(value) && expectedDT.variant !== "NODE")) {
                    const resolvedValueDT = resolveDataTypeWithGenerics(valueDT, genericMap)
                    isValid = useDataTypeValidation(resolvedExpectedDT, resolvedValueDT)
                } else {
                    isValid = useValueValidation(
                        value,
                        resolvedExpectedDT,
                        dataTypeService,
                        flow,
                        expectedResolvedType?.genericType?.genericMappers!,
                        functionService
                    )
                }
            } else {
                if (isReference(value) || (isNode(value) && expectedDT.variant !== "NODE")) {
                    isValid = useDataTypeValidation(expectedDT, valueDT)
                } else {
                    isValid = useValueValidation(value, expectedDT, dataTypeService, flow, [], functionService)
                }
            }

            if (!isValid) {
                errors.push(errorResult(i, expectedDT, valueDT))
            }
        }

        return errors.length > 0 ? errors : null
    }, [flow, node, values, functionDefinition, parameters, genericKeys, genericMap, resolveValueType, nodeId, flowId, functionStore, flowStore, dataTypeStore, dataTypeService])
}