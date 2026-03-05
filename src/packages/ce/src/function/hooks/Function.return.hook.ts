import type {DataTypeIdentifier, NodeParameterValue} from "@code0-tech/sagittarius-graphql-types";
import {FunctionDefinitionView} from "@code0-tech/pictor";
import {DatatypeService} from "@edition/datatype/services/Datatype.service";
import {FunctionService} from "@edition/function/services/Function.service";
import {replaceGenericKeysInType, resolveGenericKeys} from "@edition/flow/utils/generics";

export const useReturnType = (
    func: FunctionDefinitionView,
    values: NodeParameterValue[],
    dataTypeService: DatatypeService,
    functionService: FunctionService,
): DataTypeIdentifier | null => {

    if (!func?.returnType) return null

    const genericTypeMap = resolveGenericKeys(func, values, dataTypeService, functionService)
    return replaceGenericKeysInType(func.returnType, genericTypeMap)

}