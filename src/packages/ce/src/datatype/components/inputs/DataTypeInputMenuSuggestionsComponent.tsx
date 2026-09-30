import React from "react";
import {
    Flow,
    LiteralValue,
    NodeFunction,
    ReferencePath,
    ReferenceValue,
    SubFlowValue
} from "@code0-tech/sagittarius-graphql-types";
import {Flex, hashToColor, MenuSeparator, TagInputMenuItem, TagInputSubMenu, Text} from "@code0-tech/pictor";
import {IconChevronRight, IconPlus} from "@tabler/icons-react";
import {useParams} from "next/navigation";
import {ReferenceBadgeComponent} from "@edition/datatype/components/badges/ReferenceBadgeComponent";
import {NodeBadgeComponent} from "@edition/datatype/components/badges/NodeBadgeComponent";
import {useFlowReferenceHoverStore} from "@edition/flow/hooks/Flow.reference.hover.hook";
import {useMappedSuggestions} from "@edition/function/components/suggestion/Suggestion.util";
import {icon, IconString} from "@core/util/icons";
import {
    DataTypeInputMenuReferencePathComponent,
    DataTypeInputMenuReferencePathNode
} from "@edition/datatype/components/inputs/DataTypeInputMenuReferencePathComponent";

export interface DataTypeInputMenuSuggestionsComponentProps {
    suggestions: (NodeFunction | SubFlowValue | ReferenceValue | LiteralValue)[]
    tagKeys: unknown[]
    customLogicGroupKey?: unknown
    variantKeyPrefix?: string
}

interface MenuReferenceGroup {
    root: ReferenceValue
    value?: ReferenceValue
    tagKey?: unknown
    children: Map<string, DataTypeInputMenuReferencePathNode>
    suggestions: { value: ReferenceValue, tagKey: unknown }[]
}

type MenuEntry =
    | { kind: "value", value: LiteralValue | SubFlowValue | NodeFunction, tagKey: unknown }
    | { kind: "reference-group", key: string, group: MenuReferenceGroup }

export const DataTypeInputMenuSuggestionsComponent: React.FC<DataTypeInputMenuSuggestionsComponentProps> = (props) => {

    const {suggestions, tagKeys, customLogicGroupKey, variantKeyPrefix} = props

    const params = useParams()
    const flowIndex = params.flowId as any as number
    const flowId: Flow['id'] = `gid://sagittarius/Flow/${flowIndex}`
    const setHoveredNodeId = useFlowReferenceHoverStore(state => state.setHoveredNodeId)

    const moduleGroups = useMappedSuggestions(suggestions, ["SubFlowValue", "NodeFunction"])

    const groupedValues = React.useMemo(
        () => new Set(moduleGroups.flatMap(group => group.suggestions.flatMap(suggestion => suggestion.variants))),
        [moduleGroups]
    )

    const menuEntries = React.useMemo(() => {

        const entries: MenuEntry[] = []
        const groups = new Map<string, MenuReferenceGroup>()

        suggestions.forEach((suggest, index) => {
            const tagKey = tagKeys[index]

            if (suggest.__typename === "LiteralValue") {
                entries.push({kind: "value", value: suggest, tagKey})
                return
            }

            if (suggest.__typename === "SubFlowValue" || suggest.__typename === "NodeFunction") {
                if (!groupedValues.has(suggest)) entries.push({kind: "value", value: suggest, tagKey})
                return
            }

            if (suggest.__typename !== "ReferenceValue") return

            const key = [suggest.nodeFunctionId, suggest.inputTypeIdentifier, suggest.inputIndex, suggest.parameterIndex].join("/")
            let group = groups.get(key)
            if (!group) {
                group = {
                    root: {...suggest, referencePath: undefined},
                    children: new Map(),
                    suggestions: []
                }
                groups.set(key, group)
                entries.push({kind: "reference-group", key, group})
            }
            group.suggestions.push({value: suggest, tagKey})

            const segments = suggest.referencePath ?? []
            if (segments.length <= 0) {
                group.value = suggest
                group.tagKey = tagKey
                return
            }

            let children = group.children
            let node: DataTypeInputMenuReferencePathNode | undefined = undefined
            segments.forEach((segment: ReferencePath) => {
                const label = `${segment.path ?? ""}${segment.arrayIndex != null ? `[${segment.arrayIndex}]` : ""}`
                if (!children.has(label)) {
                    children.set(label, {label, children: new Map()})
                }
                node = children.get(label)!
                children = node.children
            })
            node!.value = suggest
            node!.tagKey = tagKey
        })

        return entries
    }, [suggestions, tagKeys, groupedValues])

    return <>
        {customLogicGroupKey !== undefined ? <>
            <TagInputMenuItem value={customLogicGroupKey} aliases={["add custom logic group"]}
                              onMouseEnter={() => setHoveredNodeId(null)}>
                <Flex align={"center"} style={{gap: "0.35rem"}}>
                    <IconPlus size={13}/>
                    <Text>Add custom logic group</Text>
                </Flex>
            </TagInputMenuItem>
            {menuEntries.length > 0 || moduleGroups.length > 0 ? <MenuSeparator/> : null}
        </> : null}
        {menuEntries.map((entry, index) => {
            if (entry.kind === "value" && entry.value.__typename === "LiteralValue") {
                return <TagInputMenuItem key={index} value={entry.tagKey} data={entry.value}
                                         onMouseEnter={() => setHoveredNodeId(null)}>
                    <Flex style={{gap: "0.35rem"}} align={"center"}>
                        {String(entry.value.value)}
                    </Flex>
                </TagInputMenuItem>
            }

            if (entry.kind === "value" && entry.value.__typename === "SubFlowValue") {
                return <TagInputMenuItem key={index} value={entry.tagKey} data={entry.value}
                                         aliases={[entry.value.functionDefinition?.names?.[0]?.content ?? ""]}
                                         onMouseEnter={() => setHoveredNodeId(null)}>
                    <NodeBadgeComponent value={entry.value}/>
                </TagInputMenuItem>
            }

            if (entry.kind === "value" && entry.value.__typename === "NodeFunction") {
                return <TagInputMenuItem key={index} value={entry.tagKey} data={entry.value}
                                         aliases={[entry.value.functionDefinition?.names?.[0]?.content ?? ""]}
                                         onMouseEnter={() => setHoveredNodeId(null)}>
                    <NodeBadgeComponent value={{
                        __typename: "SubFlowValue",
                        functionDefinition: entry.value.functionDefinition
                    }}/>
                </TagInputMenuItem>
            }

            if (entry.kind === "reference-group") {
                const group = entry.group
                const nodeFunctionId = group.root.nodeFunctionId as string | null | undefined
                const targetNodeId = (!nodeFunctionId || nodeFunctionId === "undefined"
                    ? flowId
                    : nodeFunctionId) as string

                if (group.suggestions.length === 1) {
                    const only = group.suggestions[0]
                    return <TagInputMenuItem key={entry.key} value={only.tagKey} data={only.value}
                                             aliases={[only.value.inputTypeIdentifier ?? "", ...(only.value.referencePath ?? []).map(path => path.path ?? "")]}
                                             onMouseEnter={() => setHoveredNodeId(targetNodeId)}
                                             onMouseLeave={() => setHoveredNodeId(null)}>
                        <ReferenceBadgeComponent value={only.value}/>
                    </TagInputMenuItem>
                }

                return <TagInputSubMenu key={entry.key} label={
                    <Flex align={"center"} justify={"space-between"} style={{gap: "0.7rem"}} w={"100%"}
                          onMouseEnter={() => setHoveredNodeId(targetNodeId)}
                          onMouseLeave={() => setHoveredNodeId(null)}>
                        <ReferenceBadgeComponent value={group.root}/>
                        <IconChevronRight size={12}/>
                    </Flex>
                }>
                    {group.value && group.tagKey !== undefined ? (
                        <TagInputMenuItem value={group.tagKey} data={group.value}
                                          aliases={[group.value.inputTypeIdentifier ?? ""]}>
                            <ReferenceBadgeComponent value={group.value}/>
                        </TagInputMenuItem>
                    ) : null}
                    <DataTypeInputMenuReferencePathComponent nodes={group.children}/>
                </TagInputSubMenu>
            }

            return null
        })}
        {menuEntries.length > 0 && moduleGroups.length > 0 ? <MenuSeparator/> : null}
        {moduleGroups.map((group, index) => {

            const ModuleIcon = icon(group.icon as IconString)

            return <TagInputSubMenu key={`group-${index}`} label={
                <Flex align={"center"} justify={"space-between"} style={{gap: "0.7rem"}} w={"100%"}
                      onMouseEnter={() => setHoveredNodeId(null)}>
                    <Flex align={"center"} style={{gap: "0.35rem"}}>
                        <ModuleIcon size={13} color={hashToColor(`group-${index}`)}/>
                        <Text>{group.displayMessage}</Text>
                    </Flex>
                    <IconChevronRight size={12}/>
                </Flex>
            }>
                {group.suggestions.map((suggestion, suggestionIndex) => {

                    const FunctionIcon = icon(suggestion.icon as IconString)
                    const aliases = [suggestion.displayMessage, ...(suggestion.aliases ?? [])]
                    const directValue = suggestion.variants.find((variant): variant is SubFlowValue => variant.__typename === "SubFlowValue")
                    const resultValue = suggestion.variants.find(variant => variant.__typename === "NodeFunction")
                    const directTagKey = directValue ? tagKeys[suggestions.indexOf(directValue)] : undefined
                    const resultTagKey = resultValue ? tagKeys[suggestions.indexOf(resultValue)] : undefined

                    if (directTagKey !== undefined && resultTagKey !== undefined && variantKeyPrefix !== undefined) {
                        return <TagInputMenuItem key={suggestionIndex}
                                                 value={`${variantKeyPrefix}${directValue?.functionDefinition?.id ?? suggestionIndex}`}
                                                 data={suggestion}
                                                 aliases={aliases}
                                                 title={suggestion.description}>
                            <Flex align={"center"} style={{gap: "0.35rem"}}>
                                <FunctionIcon size={13} color={hashToColor(`group-${index}`)}/>
                                <Text>{suggestion.displayMessage}</Text>
                            </Flex>
                        </TagInputMenuItem>
                    }

                    if (directTagKey !== undefined && resultTagKey !== undefined) {
                        return <TagInputSubMenu key={suggestionIndex} label={
                            <Flex align={"center"} justify={"space-between"} style={{gap: "0.7rem"}} w={"100%"}>
                                <Flex align={"center"} style={{gap: "0.35rem"}}>
                                    <FunctionIcon size={13} color={hashToColor(`group-${index}`)}/>
                                    <Text>{suggestion.displayMessage}</Text>
                                </Flex>
                                <IconChevronRight size={12}/>
                            </Flex>
                        }>
                            <TagInputMenuItem value={directTagKey}
                                              data={directValue}
                                              aliases={aliases}
                                              title={`This step decides when to use ${suggestion.displayMessage} and what to put into it.`}>
                                <Text>Let this step use it</Text>
                            </TagInputMenuItem>
                            <TagInputMenuItem value={resultTagKey}
                                              data={resultValue}
                                              aliases={aliases}
                                              title={`${suggestion.displayMessage} becomes its own step ahead of this one and its outcome is used here.`}>
                                <Text>Use it first, then continue</Text>
                            </TagInputMenuItem>
                        </TagInputSubMenu>
                    }

                    const tagKey = tagKeys[suggestions.indexOf(suggestion.value)]
                    if (tagKey === undefined) return null

                    return <TagInputMenuItem key={suggestionIndex}
                                             value={tagKey}
                                             data={suggestion.value}
                                             aliases={aliases}
                                             title={suggestion.description}>
                        <Flex align={"center"} style={{gap: "0.35rem"}}>
                            <FunctionIcon size={13} color={hashToColor(`group-${index}`)}/>
                            <Text>{suggestion.displayMessage}</Text>
                        </Flex>
                    </TagInputMenuItem>
                })}
            </TagInputSubMenu>
        })}
    </>
}
