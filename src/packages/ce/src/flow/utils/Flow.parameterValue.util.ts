import {NodeParameterValue} from "@code0-tech/sagittarius-graphql-types";

export const hasParameterValue = (value?: NodeParameterValue | null): boolean => {
    if (!value) return false
    if (value.__typename !== "LiteralValue") return true
    return (value.value !== null && value.value !== undefined) || (value.references?.length ?? 0) > 0
}
