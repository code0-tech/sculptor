import {DataTypeRule, staticImplements} from "./DataTypeRule";
import type {DataTypeRulesRegexConfig, NodeParameterValue} from "@code0-tech/sagittarius-graphql-types";

@staticImplements<DataTypeRule>()
export class DataTypeRegexRule {
    public static validate(value: NodeParameterValue, config: DataTypeRulesRegexConfig): boolean {
        if (value?.__typename != 'LiteralValue') return false
        if (!config.pattern) return false
        return new RegExp(config.pattern).test(String(value.value))
    }
}