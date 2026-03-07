import {DataTypeRegexRule} from "./DataTypeRegexRule";
import {DataTypeRangeRule} from "./DataTypeNumberRangeRule";
import {
    DataTypeItemOfCollectionRule
} from "./DataTypeItemOfCollectionRule";
import {DataTypeContainsTypeRule} from "./DataTypeContainsTypeRule";
import {DataTypeContainsKeyRule} from "./DataTypeContainsKeyRule";
import {DataTypeRule} from "./DataTypeRule";
import {DataTypeReturnTypeRule} from "./DataTypeReturnTypeRule";
import type {DataTypeRulesVariant} from "@code0-tech/sagittarius-graphql-types";

export const RuleMap = new Map<DataTypeRulesVariant, DataTypeRule>([
    ["REGEX" as DataTypeRulesVariant.Regex, DataTypeRegexRule],
    ["NUMBER_RANGE" as DataTypeRulesVariant.NumberRange, DataTypeRangeRule],
    ["ITEM_OF_COLLECTION" as DataTypeRulesVariant.ItemOfCollection, DataTypeItemOfCollectionRule],
    ["CONTAINS_TYPE" as DataTypeRulesVariant.ContainsType, DataTypeContainsTypeRule],
    ["CONTAINS_KEY" as DataTypeRulesVariant.ContainsKey, DataTypeContainsKeyRule],
    ["RETURN_TYPE" as DataTypeRulesVariant.ReturnType, DataTypeReturnTypeRule]

])