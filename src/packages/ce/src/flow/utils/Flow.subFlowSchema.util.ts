import {ListInput, Schema} from "@code0-tech/triangulum";

export const isSubFlowSchema = (schema?: Schema): boolean => {
    if (!schema) return false
    if (schema.input === "sub-flow" || schema.input === "list-sub-flow") return true
    if (schema.input !== "list") return false

    const list = schema as ListInput
    return [...(list.items ?? []), ...(list.declaredItems ?? [])].some(isSubFlowSchema)
}
