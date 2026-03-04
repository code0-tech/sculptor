import {DataTypeRule, staticImplements} from "./DataTypeRule";
import type {DataTypeRulesNumberRangeConfig, NodeParameterValue} from "@code0-tech/sagittarius-graphql-types";

@staticImplements<DataTypeRule>()
export class DataTypeRangeRule {
    public static validate(value: NodeParameterValue, config: DataTypeRulesNumberRangeConfig): boolean {
        if (value.__typename !== 'LiteralValue') return false
        if (!config.from || !config.to) return false
        return value.value >= config.from && value.value <= config.to
    }
}