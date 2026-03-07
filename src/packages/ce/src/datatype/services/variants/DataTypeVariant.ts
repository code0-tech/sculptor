import type {NodeParameterValue} from "@code0-tech/sagittarius-graphql-types";

export interface DataTypeVariant {
    validate(value: NodeParameterValue): boolean
}