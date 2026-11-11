import React from "react";
import {
    Button,
    Flex,
    Icon,
    Text,
    Tooltip,
    TooltipContent,
    TooltipPortal,
    TooltipTrigger,
    useService
} from "@code0-tech/pictor";
import {
    Flow,
    InlineReferenceValue,
    NodeFunction,
    ReferenceValue,
    SubFlowValue
} from "@code0-tech/sagittarius-graphql-types";
import {ListEntry, toListEntry} from "@edition/datatype/components/inputs/list/DataTypeListInput.util";
import {SuggestionValue} from "@edition/function/components/suggestion/Suggestion.util";
import {FlowService} from "@edition/flow/services/Flow.service";
import {
    DataTypeMarkdownInputComponent
} from "@edition/datatype/components/inputs/markdown/DataTypeMarkdownInputComponent";
import {ReferenceEntryBadgeComponent} from "@edition/datatype/components/badges/ReferenceEntryBadgeComponent";
import "./DataTypeListTextMarkdownComponent.style.scss";

export interface DataTypeListTextMarkdownComponentProps {
    entries: ListEntry[]
    references?: InlineReferenceValue[] | null
    onChange: (entries: ListEntry[], references: InlineReferenceValue[]) => void
    suggestions?: SuggestionValue[]
    flowId: Flow['id']
    nodeId?: NodeFunction['id']
    parameterIndex?: number
    toggle?: React.ReactNode
}

interface MarkdownItem {
    id: number
    entry: ListEntry
}

export const DataTypeListTextMarkdownComponent: React.FC<DataTypeListTextMarkdownComponentProps> = (props) => {

    const {entries, references, suggestions, flowId, nodeId, parameterIndex, toggle, onChange} = props

    const flowService = useService(FlowService)

    const nextId = React.useRef(entries.length)
    const inline = React.useRef(new Map<number, InlineReferenceValue[]>())
    const touched = React.useRef(false)
    const [seedVersion, setSeedVersion] = React.useState(0)
    const [items, setItems] = React.useState<MarkdownItem[]>(() =>
        entries.map((entry, index) => ({id: index, entry})))

    const entriesKey = React.useMemo(() => JSON.stringify(entries), [entries])
    const seededKey = React.useRef(entriesKey)

    const update = React.useCallback((next: MarkdownItem[]) => {
        const changed = next
            .map(item => item.entry)
            .filter(entry => typeof entry !== "string" || entry.trim().length > 0)

        const text = changed.filter(entry => typeof entry === "string").join("\n")
        const all = [...Array.from(inline.current.values()).flat(), ...(references ?? [])]

        touched.current = true
        setItems(next)
        onChange(changed, all.filter((reference, index) =>
            all.findIndex(current => current.signature === reference.signature) === index
            && text.includes(`\${${reference.signature}}`)))
    }, [references, onChange])

    const remove = React.useCallback((id: number) => {
        update(items.filter(current => current.id !== id))
    }, [items, update])

    React.useEffect(() => {
        if (touched.current || entriesKey === seededKey.current) return

        seededKey.current = entriesKey
        nextId.current = entries.length
        setItems(entries.map((entry, index) => ({id: index, entry})))
        setSeedVersion(version => version + 1)
    }, [entriesKey, entries])

    return <div className={"data-type-markdown"}>
        {items.length === 0 && <Text size={"sm"} hierarchy={"tertiary"}>
            No items yet
        </Text>}
        {items.map((item, index) => {
            const reference = item.entry as ReferenceValue | SubFlowValue | NodeFunction | null
            if (reference?.__typename === "ReferenceValue"
                || reference?.__typename === "SubFlowValue"
                || reference?.__typename === "NodeFunction") return <Flex
                key={`${item.id}-${seedVersion}`}
                className={"data-type-markdown__reference"}
                align={"center"}>
                <ReferenceEntryBadgeComponent value={reference}/>
                <Text size={"xs"} hierarchy={"tertiary"}>
                    Referenced value — edit it as a tag
                </Text>
                <Button variant={"none"}
                        color={"error"}
                        paddingSize={"xxs"}
                        className={"data-type-markdown__reference-remove"}
                        aria-label={`Remove item ${index + 1}`}
                        onClick={() => remove(item.id)}>
                    <Icon icon={"tabler:trash"} size={13}/>
                </Button>
            </Flex>

            return <DataTypeMarkdownInputComponent key={`${item.id}-${seedVersion}`}
                                                   label={`Item ${index + 1}`}
                                                   value={typeof item.entry === "string" ? item.entry : ""}
                                                   references={references}
                                                   signaturePrefix={`ref_${item.id}`}
                                                   suggestions={suggestions}
                                                   flowId={flowId}
                                                   nodeId={nodeId}
                                                   parameterIndex={parameterIndex}
                                                   onChange={(entry, changed) => {
                                                       inline.current.set(item.id, changed)
                                                       update(items.map(current =>
                                                           current.id === item.id ? {...current, entry} : current))
                                                   }}
                                                   onSelect={value => update(items.map(current =>
                                                       current.id === item.id
                                                           ? {
                                                               ...current,
                                                               entry: toListEntry(value, flowService, flowId, nodeId)
                                                           }
                                                           : current))}
                                                   actions={<Tooltip>
                                                       <TooltipTrigger asChild>
                                                           <Button color={"error"}
                                                                   paddingSize={"xxs"}
                                                                   aria-label={`Remove item ${index + 1}`}
                                                                   onClick={() => remove(item.id)}>
                                                               <Icon icon={"tabler:trash"} size={13}/>
                                                           </Button>
                                                       </TooltipTrigger>
                                                       <TooltipPortal>
                                                           <TooltipContent color={"primary"}
                                                                           sideOffset={8}
                                                                           style={{zIndex: 51}}>
                                                               <Text size={"sm"}>Remove this item</Text>
                                                           </TooltipContent>
                                                       </TooltipPortal>
                                                   </Tooltip>}/>
        })}
        <Flex align={"center"} justify={"space-between"} style={{width: "100%"}}>
            {toggle}
            <Button variant={"none"}
                    paddingSize={"xxs"}
                    justify={"end"}
                    onClick={() => update([...items, {id: nextId.current++, entry: ""}])}>
                <Flex align={"center"} style={{gap: "0.35rem"}}>
                    <Icon icon={"tabler:plus"} size={13}/>
                    <Text size={"sm"}>Add item</Text>
                </Flex>
            </Button>
        </Flex>
    </div>
}
