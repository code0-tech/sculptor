import type {
    LiteralValue,
    NodeFunction,
    ReferenceValue
} from "@code0-tech/sagittarius-graphql-types";

export enum FunctionSuggestionType {
    REF_OBJECT,
    VALUE,
    FUNCTION,
    FUNCTION_COMBINATION,
    DATA_TYPE,
}

export interface FunctionSuggestion {

    displayText: string[]
    path: number[]
    value: LiteralValue | ReferenceValue | NodeFunction
    type: FunctionSuggestionType
}