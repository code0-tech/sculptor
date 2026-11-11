import React from "react";
import {
    Flex,
    MenuItem,
    MenuSub,
    MenuSubContent,
    MenuSubTrigger,
    TagInputMenuItem,
    TagInputSubMenu
} from "@code0-tech/pictor";
import {IconChevronRight} from "@tabler/icons-react";
import {SuggestionMenuEntry, SuggestionTagKey, SuggestionValue} from "@edition/function/components/suggestion/Suggestion.util";
import {useFlowReferenceHoverStore} from "@edition/flow/hooks/Flow.reference.hover.hook";
import {NodeBadgeComponent} from "@edition/datatype/components/badges/NodeBadgeComponent";
import {ReferenceBadgeComponent} from "@edition/datatype/components/badges/ReferenceBadgeComponent";
import {DataTypeInputMenuReferencePathComponent} from "@edition/datatype/components/inputs/DataTypeInputMenuReferencePathComponent";

export interface DataTypeInputMenuEntriesComponentProps {
    entries: SuggestionMenuEntry[]
    mode: "tag" | "menu"
    tagKeys?: SuggestionTagKey[]
    onSelect?: (value: SuggestionValue) => void
}

export const DataTypeInputMenuEntriesComponent: React.FC<DataTypeInputMenuEntriesComponentProps> = (props) => {

    const {entries, mode, tagKeys, onSelect} = props

    const setHoveredNodeId = useFlowReferenceHoverStore(state => state.setHoveredNodeId)

    return <>
        {entries.map((entry, index) => {

            if (entry.kind === "value") {

                const literal = entry.value.__typename === "LiteralValue" ? entry.value : undefined
                const subFlow = entry.value.__typename === "SubFlowValue" ? entry.value : undefined
                const node = entry.value.__typename === "NodeFunction" ? entry.value : undefined
                const definition = subFlow?.functionDefinition ?? node?.functionDefinition

                const badge = literal
                    ? <Flex style={{gap: "0.35rem"}} align={"center"}>{String(literal.value)}</Flex>
                    : subFlow
                        ? <NodeBadgeComponent value={subFlow}/>
                        : <NodeBadgeComponent value={{
                            __typename: "SubFlowValue",
                            functionDefinition: node?.functionDefinition
                        }}/>

                if (mode === "menu") return <MenuItem key={index} onMouseEnter={() => setHoveredNodeId(null)}
                                                      onFocus={() => setHoveredNodeId(null)}
                                                      onSelect={() => onSelect?.(entry.value)}>
                    {badge}
                </MenuItem>

                return <TagInputMenuItem key={index} value={tagKeys?.[entry.index]} data={entry.value}
                                         aliases={definition ? [definition.names?.[0]?.content ?? ""] : undefined}
                                         onMouseEnter={() => setHoveredNodeId(null)}>
                    {badge}
                </TagInputMenuItem>
            }

            const group = entry.group

            if (group.suggestions.length === 1) {
                const only = group.suggestions[0]

                const onlyLabel = <Flex align={"center"} w={"100%"}
                                        onMouseEnter={() => setHoveredNodeId(group.targetNodeId)}
                                        onMouseLeave={() => setHoveredNodeId(null)}>
                    <ReferenceBadgeComponent value={only.value}/>
                </Flex>

                if (mode === "menu") return <MenuItem key={entry.key}
                                                      onMouseEnter={() => setHoveredNodeId(group.targetNodeId)}
                                                      onMouseLeave={() => setHoveredNodeId(null)}
                                                      onFocus={() => setHoveredNodeId(group.targetNodeId)}
                                                      onSelect={() => onSelect?.(only.value)}>
                    {onlyLabel}
                </MenuItem>

                return <TagInputMenuItem key={entry.key} value={tagKeys?.[only.index]} data={only.value}
                                         aliases={[group.displayName ?? "", only.value.inputTypeIdentifier ?? "", ...(only.value.referencePath ?? []).map(path => path.path ?? "")]}
                                         onMouseEnter={() => setHoveredNodeId(group.targetNodeId)}
                                         onMouseLeave={() => setHoveredNodeId(null)}>
                    {onlyLabel}
                </TagInputMenuItem>
            }

            const groupTagKey = group.index === undefined ? undefined : tagKeys?.[group.index]

            const groupSelfLabel = group.value
                ? <Flex align={"center"} w={"100%"}
                        onMouseEnter={() => setHoveredNodeId(group.targetNodeId)}
                        onMouseLeave={() => setHoveredNodeId(null)}>
                    <ReferenceBadgeComponent value={group.value}/>
                </Flex>
                : null

            const groupSelf = mode === "menu"
                ? (group.value
                    ? <MenuItem onMouseEnter={() => setHoveredNodeId(group.targetNodeId)}
                                onMouseLeave={() => setHoveredNodeId(null)}
                                onFocus={() => setHoveredNodeId(group.targetNodeId)}
                                onSelect={() => onSelect?.(group.value!)}>
                        {groupSelfLabel}
                    </MenuItem>
                    : null)
                : (group.value && groupTagKey !== undefined
                    ? <TagInputMenuItem value={groupTagKey} data={group.value}
                                        aliases={[group.displayName ?? "", group.value.inputTypeIdentifier ?? ""]}
                                        onMouseEnter={() => setHoveredNodeId(group.targetNodeId)}
                                        onMouseLeave={() => setHoveredNodeId(null)}>
                        {groupSelfLabel}
                    </TagInputMenuItem>
                    : null)

            const groupLabel = <Flex align={"center"} justify={"space-between"} style={{gap: "0.7rem"}} w={"100%"}
                                     onMouseEnter={() => setHoveredNodeId(group.targetNodeId)}
                                     onMouseLeave={() => setHoveredNodeId(null)}>
                <ReferenceBadgeComponent value={group.root}/>
                <IconChevronRight size={12}/>
            </Flex>

            if (mode === "menu") return <MenuSub key={entry.key}>
                <MenuSubTrigger onMouseEnter={() => setHoveredNodeId(group.targetNodeId)}
                                onMouseLeave={() => setHoveredNodeId(null)}
                                onFocus={() => setHoveredNodeId(group.targetNodeId)}>
                    {groupLabel}
                </MenuSubTrigger>
                <MenuSubContent onMouseEnter={() => setHoveredNodeId(group.targetNodeId)}
                                onMouseLeave={() => setHoveredNodeId(null)}>
                    {groupSelf}
                    <DataTypeInputMenuReferencePathComponent nodes={group.children}
                                                             targetNodeId={group.targetNodeId} mode={mode}
                                                             onSelect={onSelect}/>
                </MenuSubContent>
            </MenuSub>

            return <TagInputSubMenu key={entry.key} label={groupLabel}>
                {groupSelf}
                <DataTypeInputMenuReferencePathComponent nodes={group.children} targetNodeId={group.targetNodeId}
                                                         mode={mode} tagKeys={tagKeys}/>
            </TagInputSubMenu>
        })}
    </>
}
