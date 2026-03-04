import type {Flow, GenericMapper, NodeParameterValue} from "@code0-tech/sagittarius-graphql-types";
import {DataTypeView} from "@edition/datatype/services/DataType.view";
import {DatatypeService} from "@edition/datatype/services/Datatype.service";
import {FunctionService} from "@edition/function/services/Function.service";
import {RuleMap} from "@edition/datatype/services/rules/DataTypeRules";
import {VariantsMap} from "@edition/datatype/services/variants/DataTypeVariants";

export const useValueValidation = (
    value: NodeParameterValue,
    dataType: DataTypeView,
    dataTypeService: DatatypeService,
    flow?: Flow,
    generics?: GenericMapper[],
    functionService?: FunctionService,
): boolean => {

    const map = new Map<string, GenericMapper>(generics?.map(generic => [generic.target!!, generic]))

    const isRulesValid = dataType?.rules?.nodes?.every(rule => {
        if (!rule || !rule.variant || !rule.config) return false
        if (!RuleMap.get(rule.variant)) return true //TODO; missing parent type rule
        return RuleMap.get(rule.variant)?.validate(value, rule.config, map, flow, dataTypeService, functionService)
    }) ?? true

    const isVariantValid = VariantsMap.get(dataType.variant!!)?.validate(value) ?? true

    return isRulesValid && isVariantValid
}