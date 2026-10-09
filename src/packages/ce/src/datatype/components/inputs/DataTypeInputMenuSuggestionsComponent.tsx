import React from "react";
import {Flow, NodeFunction, ReferenceValue, SubFlowValue} from "@code0-tech/sagittarius-graphql-types";
import {
    Flex,
    hashToColor,
    MenuItem,
    MenuSeparator,
    MenuSub,
    MenuSubContent,
    MenuSubTrigger,
    TagInputMenu,
    TagInputMenuItem,
    TagInputSubMenu,
    Text,
    useService
} from "@code0-tech/pictor";
import {IconChevronRight, IconPlus} from "@tabler/icons-react";
import {useParams} from "next/navigation";
import {ReferenceBadgeComponent} from "@edition/datatype/components/badges/ReferenceBadgeComponent";
import {NodeBadgeComponent} from "@edition/datatype/components/badges/NodeBadgeComponent";
import {useFlowReferenceHoverStore} from "@edition/flow/hooks/Flow.reference.hover.hook";
import {
    Suggestion,
    SuggestionTagKey,
    SuggestionValue,
    useSuggestionMenuEntries
} from "@edition/function/components/suggestion/Suggestion.util";
import {
    SuggestionVariantDialogComponent
} from "@edition/function/components/suggestion/SuggestionVariantDialogComponent";
import {FlowService} from "@edition/flow/services/Flow.service";
import {icon, IconString} from "@core/util/icons";
import {
    DataTypeInputMenuReferencePathComponent
} from "@edition/datatype/components/inputs/DataTypeInputMenuReferencePathComponent";

export interface DataTypeInputMenuSuggestionsComponentProps {
    suggestions: SuggestionValue[]
    mode?: "tag" | "menu"
    tagKeys?: SuggestionTagKey[]
    customLogicGroupKey?: SuggestionTagKey
    onCustomLogicGroupSelect?: () => void
    flowId?: Flow['id']
    nodeId?: NodeFunction['id']
    parameterIndex?: number
    onSelect?: (value: SuggestionValue) => void
    onVariantRequest?: (suggestion: Suggestion) => void
    onVariantSelect?: (value: ReferenceValue | SubFlowValue) => void
    children?: React.ReactNode
}

export const DataTypeInputMenuSuggestionsComponent: React.FC<DataTypeInputMenuSuggestionsComponentProps> = (props) => {

    const {
        suggestions,
        mode = "tag",
        tagKeys,
        customLogicGroupKey,
        onCustomLogicGroupSelect,
        nodeId,
        parameterIndex,
        onSelect,
        onVariantRequest,
        onVariantSelect,
        children
    } = props

    const params = useParams()
    const flowService = useService(FlowService)
    const flowId: Flow['id'] = props.flowId ?? `gid://sagittarius/Flow/${Number(params.flowId) || 1}`
    const setHoveredNodeId = useFlowReferenceHoverStore(state => state.setHoveredNodeId)
    const [variantSuggestion, setVariantSuggestion] = React.useState<Suggestion | null>(null)

    const {entries, moduleGroups} = useSuggestionMenuEntries(suggestions, flowId)

    const requestVariant = onVariantRequest ?? setVariantSuggestion

    const hasCustomLogicGroup = mode === "menu" ? !!onCustomLogicGroupSelect : customLogicGroupKey !== undefined

    if (React.Children.count(children) <= 0
        && !hasCustomLogicGroup
        && entries.length <= 0
        && moduleGroups.length <= 0) return null

    const items = <>
        {children}
        {React.Children.count(children) > 0 && (hasCustomLogicGroup || entries.length > 0 || moduleGroups.length > 0) ?
            <MenuSeparator/> : null}
        {hasCustomLogicGroup ? <>
            {mode === "menu" ?
                <MenuItem onMouseEnter={() => setHoveredNodeId(null)} onFocus={() => setHoveredNodeId(null)}
                          onSelect={() => onCustomLogicGroupSelect?.()}>
                    <Flex align={"center"} style={{gap: "0.35rem"}}>
                        <IconPlus size={13}/>
                        <Text>Add custom logic group</Text>
                    </Flex>
                </MenuItem> :
                <TagInputMenuItem value={customLogicGroupKey} aliases={["add custom logic group"]}
                                  onMouseEnter={() => setHoveredNodeId(null)}>
                    <Flex align={"center"} style={{gap: "0.35rem"}}>
                        <IconPlus size={13}/>
                        <Text>Add custom logic group</Text>
                    </Flex>
                </TagInputMenuItem>}
            {entries.length > 0 || moduleGroups.length > 0 ? <MenuSeparator/> : null}
        </> : null}
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
                                         aliases={[only.value.inputTypeIdentifier ?? "", ...(only.value.referencePath ?? []).map(path => path.path ?? "")]}
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
                                        aliases={[group.value.inputTypeIdentifier ?? ""]}
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
        {entries.length > 0 && moduleGroups.length > 0 ? <MenuSeparator/> : null}
        {moduleGroups.map((group, index) => {

            const ModuleIcon = icon(group.icon as IconString)

            const groupLabel = <Flex align={"center"} justify={"space-between"} style={{gap: "0.7rem"}} w={"100%"}
                                     onMouseEnter={() => setHoveredNodeId(null)}>
                <Flex align={"center"} style={{gap: "0.35rem"}}>
                    <ModuleIcon size={13} color={hashToColor(`group-${index}`)}/>
                    <Text>{group.displayMessage}</Text>
                </Flex>
                <IconChevronRight size={12}/>
            </Flex>

            const groupItems = group.suggestions.map((suggestion, suggestionIndex) => {

                const FunctionIcon = icon(suggestion.icon as IconString)
                const directValue = suggestion.variants.find(variant => variant.__typename === "SubFlowValue")
                const resultValue = suggestion.variants.find(variant => variant.__typename === "NodeFunction")
                const directIndex = directValue ? suggestions.indexOf(directValue) : -1
                const resultIndex = resultValue ? suggestions.indexOf(resultValue) : -1

                const content = <Flex align={"center"} style={{gap: "0.35rem"}}
                                      onMouseEnter={() => setHoveredNodeId(null)}>
                    <FunctionIcon size={13} color={hashToColor(`group-${index}`)}/>
                    <Text>{suggestion.displayMessage}</Text>
                </Flex>

                if (directIndex >= 0 && resultIndex >= 0) return <MenuItem key={suggestionIndex}
                                                                           title={suggestion.description}
                                                                           onFocus={() => setHoveredNodeId(null)}
                                                                           onSelect={() => requestVariant(suggestion)}>
                    {content}
                </MenuItem>

                if (mode === "menu") return <MenuItem key={suggestionIndex} title={suggestion.description}
                                                      onFocus={() => setHoveredNodeId(null)}
                                                      onSelect={() => onSelect?.(suggestion.value)}>
                    {content}
                </MenuItem>

                const valueIndex = suggestions.indexOf(suggestion.value)
                if (valueIndex < 0) return null

                return <TagInputMenuItem key={suggestionIndex} value={tagKeys?.[valueIndex]} data={suggestion.value}
                                         aliases={[suggestion.displayMessage, ...(suggestion.aliases ?? [])]}
                                         title={suggestion.description}>
                    {content}
                </TagInputMenuItem>
            })

            if (mode === "menu") return <MenuSub key={`group-${index}`}>
                <MenuSubTrigger onMouseEnter={() => setHoveredNodeId(null)}
                                onFocus={() => setHoveredNodeId(null)}>{groupLabel}</MenuSubTrigger>
                <MenuSubContent align={"start"} collisionPadding={16} alignOffset={0} sideOffset={0}>
                    {groupItems}
                </MenuSubContent>
            </MenuSub>

            return <TagInputSubMenu key={`group-${index}`} label={groupLabel}>
                {groupItems}
            </TagInputSubMenu>
        })}
    </>

    if (mode === "menu") return onVariantRequest ? items : null

    return <>
        <SuggestionVariantDialogComponent suggestion={variantSuggestion}
                                          flowId={flowId}
                                          nodeId={nodeId}
                                          parameterIndex={parameterIndex}
                                          open={!!variantSuggestion}
                                          onOpenChange={open => {
                                              if (!open) setVariantSuggestion(null)
                                          }}
                                          onVariantSelect={picked => {
                                              setVariantSuggestion(null)

                                              if (picked.__typename === "NodeFunction") {
                                                  const addedNodeId = flowService.addPreviousNodeById(flowId, nodeId ?? null, picked)
                                                  if (!addedNodeId) return
                                                  onVariantSelect?.({
                                                      __typename: "ReferenceValue",
                                                      nodeFunctionId: addedNodeId
                                                  })
                                                  return
                                              }

                                              if (picked.__typename === "SubFlowValue" || picked.__typename === "ReferenceValue") onVariantSelect?.(picked)
                                          }}/>
        <TagInputMenu openOn={"focus"} onMouseLeave={() => setHoveredNodeId(null)}>{items}</TagInputMenu>
    </>
}
