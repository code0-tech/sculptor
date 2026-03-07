import type {Flow, GenericMapper, NodeParameterValue} from "@code0-tech/sagittarius-graphql-types";
import {DatatypeService} from "@edition/datatype/services/Datatype.service";
import {FunctionService} from "@edition/function/services/Function.service";

export interface DataTypeRule {
    validate(value: NodeParameterValue, config: object, generics?: Map<string, GenericMapper>, flow?: Flow, dataTypeService?: DatatypeService, functionService?: FunctionService): boolean
}

export const staticImplements = <T>() => {
    return <U extends T>(constructor: U) => constructor
}

export const genericMapping = (to?: GenericMapper[], from?: Map<string, GenericMapper>): GenericMapper[] | undefined => {

    if (!to || !from) return []

    return to.map(generic => ({
        ...generic,
        target: generic.target,
        sources: generic?.sourceDataTypeIdentifiers?.map(type => from?.get(type.genericKey!!)?.sourceDataTypeIdentifiers!!).flat(),
        genericCombinationStrategies: generic?.sourceDataTypeIdentifiers?.map(type => from?.get(type.genericKey!!)?.genericCombinationStrategies!!).flat()
    }))
}