import {DataTypeRule, staticImplements} from "./DataTypeRule";
import type {DataTypeIdentifier, Flow, GenericMapper, NodeParameterValue} from "@code0-tech/sagittarius-graphql-types";
import {useValueValidation} from "@edition/flow/hooks/ValueValidation.hook";
import {replaceGenericKeysInType} from "@edition/flow/utils/generics";
import {DatatypeService} from "@edition/datatype/services/Datatype.service";

export interface DFlowDataTypeParentRuleConfig {
    type: DataTypeIdentifier
}

@staticImplements<DataTypeRule>()
export class DataTypeParentRule {
    public static validate(value: NodeParameterValue, config: DFlowDataTypeParentRuleConfig, generics?: Map<string, GenericMapper>, flow?: Flow, dataTypeService?: DatatypeService): boolean {

        const replacedType = generics ? replaceGenericKeysInType(config.type, generics) : config.type

        if (!dataTypeService) return false
        return useValueValidation(value, dataTypeService.getDataType(replacedType)!!, dataTypeService, flow, Array.from(generics!!, ([_, value]) => value))

    }
}