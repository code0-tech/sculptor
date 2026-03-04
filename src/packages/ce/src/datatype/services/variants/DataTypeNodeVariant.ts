import type {NodeParameterValue} from "@code0-tech/sagittarius-graphql-types";
import {DataTypeVariant} from "./DataTypeVariant";
import {staticImplements} from "../rules/DataTypeRule";

@staticImplements<DataTypeVariant>()
export class DataTypeNodeVariant {
    public static validate(value: NodeParameterValue): boolean {
        return value.__typename == 'NodeFunctionIdWrapper';
    }
}