import {TagValue} from "@code0-tech/pictor";
import {Flow, NodeFunction, ReferenceValue, SubFlowValue} from "@code0-tech/sagittarius-graphql-types";
import {FlowService} from "@edition/flow/services/Flow.service";
import {ListEntry, toListEntry} from "@edition/datatype/components/inputs/list/DataTypeListInput.util";

const LITERAL_TOKEN = /^\$\{literal_\d+}$/

export const tagEntries = (
    tags: TagValue[],
    entries: ListEntry[],
    tokens: string[],
    references: Map<string, ReferenceValue | SubFlowValue | NodeFunction>,
    flowService: FlowService,
    flowId: Flow['id'],
    nodeId?: NodeFunction['id']
): ListEntry[] => tags.map(tag => {
    const tagKey = String(tag.value)
    const literalIndex = LITERAL_TOKEN.test(tagKey) ? tokens.indexOf(tagKey) : -1

    if (literalIndex >= 0) return entries[literalIndex]

    const suggested = references.get(tagKey)

    if (!suggested) return tagKey

    const entry = toListEntry(suggested, flowService, flowId, nodeId)
    references.set(tagKey, entry as ReferenceValue | SubFlowValue)

    return entry
})
