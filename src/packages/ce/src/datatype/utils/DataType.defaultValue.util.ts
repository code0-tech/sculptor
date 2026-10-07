import {LiteralValue} from "@code0-tech/sagittarius-graphql-types";
import {DataInput, ListInput} from "@code0-tech/triangulum";

export const generateDefaultDataValue = (schema?: DataInput): LiteralValue => {
    return {
        __typename: "LiteralValue",
        value: Object.assign({}, ...Object.entries(schema?.properties ?? {}).map(([key, propSchema]) => {
            if (!Array.isArray(propSchema)) {
                if (propSchema.input === "data") {
                    return {[key]: generateDefaultDataValue(propSchema).value}
                }
                if (propSchema.input === "list") {
                    const itemSchema = (propSchema as ListInput).items?.[0]
                    if (itemSchema && !Array.isArray(itemSchema) && itemSchema.input === "data") {
                        return {[key]: [generateDefaultDataValue(itemSchema as DataInput).value]}
                    }
                    return {[key]: []}
                }
                return {[key]: null}
            }
        }))
    }
}
