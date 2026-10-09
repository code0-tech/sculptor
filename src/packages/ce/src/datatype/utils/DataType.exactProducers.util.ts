import {NodeFunction} from "@code0-tech/sagittarius-graphql-types";
import {NodeSchema, Schema} from "@code0-tech/triangulum";

export const exactProducers = (schema?: NodeSchema | Schema): NodeFunction[] => {
    const inner = schema && "schema" in schema ? schema.schema : schema

    return (inner?.suggestions ?? []).flatMap((suggestion, index) =>
        suggestion.__typename === "NodeFunction" && inner?.suggestionCertainty?.[index]?.match === "exact"
            ? [suggestion]
            : [])
}
