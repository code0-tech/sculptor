import {DataTypeRule, staticImplements} from "./DataTypeRule";
import type {DataTypeRulesItemOfCollectionConfig, NodeParameterValue} from "@code0-tech/sagittarius-graphql-types";

/**
 * @todo deep equality check for arrays and objects
 */
@staticImplements<DataTypeRule>()
export class DataTypeItemOfCollectionRule {
    public static validate(value: NodeParameterValue, config: DataTypeRulesItemOfCollectionConfig): boolean {
        if (!config.items) return false
        return "value" in value && config.items.includes(value.value)
    }
}