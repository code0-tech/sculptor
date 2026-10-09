import {DataInput, ListInput, NodeSchema, Schema, SuggestionCertainty} from "@code0-tech/triangulum";

export const suggestionCertainties = (schema?: NodeSchema | Schema): Map<string, SuggestionCertainty> => {
    const inner = schema && "schema" in schema ? schema.schema : schema

    if (!inner) return new Map()

    const own = (inner.suggestions ?? []).map((suggestion, index): [string, SuggestionCertainty] =>
        [JSON.stringify(suggestion), inner.suggestionCertainty?.[index] ?? {match: "exact"}])

    const nested = [
        ...((inner as ListInput).items ?? []),
        ...((inner as ListInput).declaredItems ?? []),
        ...Object.values((inner as DataInput).properties ?? {}).flat()
    ].flatMap(child => [...suggestionCertainties(child)])

    return new Map([...nested, ...own])
}
