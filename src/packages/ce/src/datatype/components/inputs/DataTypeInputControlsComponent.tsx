import {
    Flow,
    LiteralValue,
    NodeFunction,
    ReferencePath,
    ReferenceValue,
    SubFlowValue
} from "@code0-tech/sagittarius-graphql-types";
import React, {ReactElement} from "react";
import {IconChevronRight, IconPlus, IconVariable, IconX} from "@tabler/icons-react";
import {useParams} from "next/navigation";
import {ReferenceBadgeComponent} from "@edition/datatype/components/badges/ReferenceBadgeComponent";
import {useFlowReferenceHoverStore} from "@edition/flow/hooks/Flow.reference.hover.hook";
import {
    Button,
    ButtonGroup,
    ButtonProps,
    Flex,
    hashToColor,
    Menu,
    MenuContent,
    MenuItem,
    MenuPortal,
    MenuSeparator,
    MenuSub,
    MenuSubContent,
    MenuSubTrigger,
    MenuTrigger,
    Text,
    Tooltip,
    TooltipContent,
    TooltipPortal,
    TooltipTrigger
} from "@code0-tech/pictor"
import {NodeBadgeComponent} from "@edition/datatype/components/badges/NodeBadgeComponent";
import {Suggestion, useMappedSuggestions} from "@edition/function/components/suggestion/Suggestion.util";
import {
    SuggestionVariantDialogComponent
} from "@edition/function/components/suggestion/SuggestionVariantDialogComponent";
import {icon, IconString} from "@core/util/icons";

export interface DataTypeInputControlsComponentProps {
    suggestions?: (NodeFunction | SubFlowValue | ReferenceValue | LiteralValue)[]
    nodeId?: NodeFunction['id']
    parameterIndex?: number
    onSelect?: (value: NodeFunction | SubFlowValue | ReferenceValue | LiteralValue | null) => void
    onCustomLogicGroupSelect?: () => void
    showSuggestions?: boolean
    children?: React.ReactElement<ButtonProps>
}

interface ReferencePathTreeNode {
    label: string
    // set when a suggestion references exactly this path
    value?: ReferenceValue
    children: Map<string, ReferencePathTreeNode>
}

interface ReferenceGroup {
    // representative reference without path, used to render the group badge
    root: ReferenceValue
    // set when a suggestion references the root itself (empty path)
    value?: ReferenceValue
    children: Map<string, ReferencePathTreeNode>
    suggestions: ReferenceValue[]
}

type MenuEntry =
    | { kind: "value", value: LiteralValue | SubFlowValue | NodeFunction }
    | { kind: "reference-group", key: string, group: ReferenceGroup }

const referenceGroupKey = (value: ReferenceValue): string => {
    return [value.nodeFunctionId, value.inputTypeIdentifier, value.inputIndex, value.parameterIndex].join("/")
}

const referencePathLabel = (path: ReferencePath): string => {
    return `${path.path ?? ""}${path.arrayIndex != null ? `[${path.arrayIndex}]` : ""}`
}

const ReferencePathMenuItems: React.FC<{
    nodes: Map<string, ReferencePathTreeNode>
    onSelect?: DataTypeInputControlsComponentProps['onSelect']
}> = ({nodes, onSelect}) => {
    return <>
        {Array.from(nodes.values()).map(node => {
            if (node.children.size <= 0) {
                return <MenuItem key={node.label} onSelect={() => node.value && onSelect?.(node.value)}>
                    {node.label}
                </MenuItem>
            }

            return <MenuSub key={node.label}>
                <MenuSubTrigger>
                    <Flex align={"center"} justify={"space-between"} style={{gap: "0.7rem"}} w={"100%"}>
                        <Text>{node.label}</Text>
                        <IconChevronRight size={12}/>
                    </Flex>
                </MenuSubTrigger>
                <MenuSubContent align={"start"} collisionPadding={16} alignOffset={0} sideOffset={0}>
                    {node.value ? (
                        <MenuItem onSelect={() => onSelect?.(node.value!)}>
                            {node.label}
                        </MenuItem>
                    ) : null}
                    <ReferencePathMenuItems nodes={node.children} onSelect={onSelect}/>
                </MenuSubContent>
            </MenuSub>
        })}
    </>
}

export const DataTypeInputControlsComponent: React.FC<DataTypeInputControlsComponentProps> = (props) => {

    const {suggestions, nodeId, parameterIndex, showSuggestions = true, onSelect, onCustomLogicGroupSelect, children} = props

    const params = useParams()
    const flowIndex = params.flowId as any as number
    const flowId: Flow['id'] = `gid://sagittarius/Flow/${flowIndex}`
    const setHoveredNodeId = useFlowReferenceHoverStore(state => state.setHoveredNodeId)
    const [variantSuggestion, setVariantSuggestion] = React.useState<Suggestion | null>(null)

    const moduleGroups = useMappedSuggestions(suggestions ?? [], ["SubFlowValue", "NodeFunction"])

    const groupedValues = React.useMemo(
        () => new Set(moduleGroups.flatMap(group => group.suggestions.flatMap(suggestion => suggestion.variants))),
        [moduleGroups]
    )

    const menuEntries = React.useMemo(() => {
        if (!suggestions) return []

        const entries: MenuEntry[] = []
        const groups = new Map<string, ReferenceGroup>()

        suggestions.forEach(suggest => {
            if (suggest.__typename === "LiteralValue") {
                entries.push({kind: "value", value: suggest})
                return
            }

            if (suggest.__typename === "SubFlowValue" || suggest.__typename === "NodeFunction") {
                if (!groupedValues.has(suggest)) entries.push({kind: "value", value: suggest})
                return
            }

            if (suggest.__typename !== "ReferenceValue") return

            const key = referenceGroupKey(suggest)
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
            group.suggestions.push(suggest)

            const segments = suggest.referencePath ?? []
            if (segments.length <= 0) {
                group.value = suggest
                return
            }

            let children = group.children
            let node: ReferencePathTreeNode | undefined = undefined
            segments.forEach(segment => {
                const label = referencePathLabel(segment)
                if (!children.has(label)) {
                    children.set(label, {label, children: new Map()})
                }
                node = children.get(label)!
                children = node.children
            })
            node!.value = suggest
        })

        return entries
    }, [suggestions, groupedValues])

    const hasSuggestions = menuEntries.length > 0 || moduleGroups.length > 0 || !!onCustomLogicGroupSelect

    return <>
        <SuggestionVariantDialogComponent suggestion={variantSuggestion}
                                         flowId={flowId}
                                         nodeId={nodeId}
                                         parameterIndex={parameterIndex}
                                         open={!!variantSuggestion}
                                         onOpenChange={open => {
                                             if (!open) setVariantSuggestion(null)
                                         }}
                                         onVariantSelect={value => {
                                             setVariantSuggestion(null)
                                             onSelect?.(value)
                                         }}/>
        <ButtonGroup color={"primary"} onClick={event => event.stopPropagation()}>
            {showSuggestions ? (
                <Menu onOpenChange={(open) => {
                    if (!open) setHoveredNodeId(null)
                }}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <MenuTrigger asChild disabled={!hasSuggestions}>
                                <Button tabIndex={!hasSuggestions ? -1 : 0} paddingSize={"xxs"}>
                                    <IconVariable size={13}/>
                                </Button>
                            </MenuTrigger>
                        </TooltipTrigger>
                        <TooltipPortal>
                            <TooltipContent side={"top"} sideOffset={8}>
                                {!hasSuggestions ? <Text>
                                    No suggestion available
                                </Text> : <Text>
                                    Suggestions for this parameter
                                </Text>}
                            </TooltipContent>
                        </TooltipPortal>
                    </Tooltip>
                    <MenuPortal>
                        <MenuContent align={"center"} alignOffset={0} sideOffset={0}>
                            {onCustomLogicGroupSelect ? <>
                                <MenuItem onMouseEnter={() => setHoveredNodeId(null)}
                                          onSelect={() => onCustomLogicGroupSelect()}>
                                    <Flex align={"center"} style={{gap: "0.35rem"}}>
                                        <IconPlus size={13}/>
                                        <Text>Add custom logic group</Text>
                                    </Flex>
                                </MenuItem>
                                {menuEntries.length > 0 || moduleGroups.length > 0 ? <MenuSeparator/> : null}
                            </> : null}
                            {menuEntries.map((entry, index) => {
                                if (entry.kind === "value" && entry.value.__typename === "LiteralValue") {
                                    return <MenuItem key={index} onMouseEnter={() => setHoveredNodeId(null)}
                                                     onSelect={() => onSelect?.(entry.value)}>
                                        <Flex style={{gap: "0.35rem"}} align={"center"}>
                                            {entry.value.value.toString()}
                                        </Flex>
                                    </MenuItem>
                                }

                                if (entry.kind === "value" && entry.value.__typename === "SubFlowValue") {
                                    return <MenuItem key={index} onMouseEnter={() => setHoveredNodeId(null)}
                                                     onSelect={() => onSelect?.(entry.value)}>
                                        <NodeBadgeComponent value={entry.value}/>
                                    </MenuItem>
                                }

                                if (entry.kind === "value" && entry.value.__typename === "NodeFunction") {
                                    return <MenuItem key={index} onMouseEnter={() => setHoveredNodeId(null)}
                                                     onSelect={() => onSelect?.(entry.value)}>
                                        <NodeBadgeComponent value={{
                                            __typename: "SubFlowValue",
                                            functionDefinition: entry.value.functionDefinition
                                        }}/>
                                    </MenuItem>
                                }

                                if (entry.kind === "reference-group") {
                                    const group = entry.group
                                    const nodeFunctionId = group.root.nodeFunctionId as string | null | undefined
                                    const targetNodeId = (!nodeFunctionId || nodeFunctionId === "undefined"
                                        ? flowId
                                        : nodeFunctionId) as string

                                    if (group.suggestions.length === 1) {
                                        return <MenuItem key={entry.key}
                                                         onMouseEnter={() => setHoveredNodeId(targetNodeId)}
                                                         onMouseLeave={() => setHoveredNodeId(null)}
                                                         onSelect={() => onSelect?.(group.suggestions[0])}>
                                            <ReferenceBadgeComponent value={group.suggestions[0]}/>
                                        </MenuItem>
                                    }

                                    return <MenuSub key={entry.key}>
                                        <MenuSubTrigger onMouseEnter={() => setHoveredNodeId(targetNodeId)}
                                                        onMouseLeave={() => setHoveredNodeId(null)}>
                                            <Flex align={"center"} justify={"space-between"} style={{gap: "0.7rem"}}
                                                  w={"100%"}>
                                                <ReferenceBadgeComponent value={group.root}/>
                                                <IconChevronRight size={12}/>
                                            </Flex>
                                        </MenuSubTrigger>
                                        <MenuSubContent onMouseEnter={() => setHoveredNodeId(targetNodeId)}
                                                        onMouseLeave={() => setHoveredNodeId(null)}>
                                            {group.value ? (
                                                <MenuItem onSelect={() => onSelect?.(group.value!)}>
                                                    <ReferenceBadgeComponent value={group.value}/>
                                                </MenuItem>
                                            ) : null}
                                            <ReferencePathMenuItems nodes={group.children} onSelect={onSelect}/>
                                        </MenuSubContent>
                                    </MenuSub>
                                }

                                return null
                            })}
                            {menuEntries.length > 0 && moduleGroups.length > 0 ? <MenuSeparator/> : null}
                            {moduleGroups.map((group, index) => {

                                const ModuleIcon = icon(group.icon as IconString)

                                return <MenuSub key={`group-${index}`}>
                                    <MenuSubTrigger onMouseEnter={() => setHoveredNodeId(null)}>
                                        <Flex align={"center"} justify={"space-between"} style={{gap: "0.7rem"}}
                                              w={"100%"}>
                                            <Flex align={"center"} style={{gap: "0.35rem"}}>
                                                <ModuleIcon size={13} color={hashToColor(`group-${index}`)}/>
                                                <Text>{group.displayMessage}</Text>
                                            </Flex>
                                            <IconChevronRight size={12}/>
                                        </Flex>
                                    </MenuSubTrigger>
                                    <MenuSubContent align={"start"} collisionPadding={16} alignOffset={0}
                                                    sideOffset={0}>
                                        {group.suggestions.map((suggestion, suggestionIndex) => {

                                            const FunctionIcon = icon(suggestion.icon as IconString)
                                            const directValue = suggestion.variants.find(variant => variant.__typename === "SubFlowValue")
                                            const resultValue = suggestion.variants.find(variant => variant.__typename === "NodeFunction")

                                            if (directValue && resultValue) {
                                                return <MenuItem key={suggestionIndex}
                                                                 title={suggestion.description}
                                                                 onSelect={() => setVariantSuggestion(suggestion)}>
                                                    <Flex align={"center"} style={{gap: "0.35rem"}}>
                                                        <FunctionIcon size={13}
                                                                      color={hashToColor(`group-${index}`)}/>
                                                        <Text>{suggestion.displayMessage}</Text>
                                                    </Flex>
                                                </MenuItem>
                                            }

                                            return <MenuItem key={suggestionIndex}
                                                             title={suggestion.description}
                                                             onSelect={() => onSelect?.(suggestion.value)}>
                                                <Flex align={"center"} style={{gap: "0.35rem"}}>
                                                    <FunctionIcon size={13}
                                                                  color={hashToColor(`group-${index}`)}/>
                                                    <Text>{suggestion.displayMessage}</Text>
                                                </Flex>
                                            </MenuItem>
                                        })}
                                    </MenuSubContent>
                                </MenuSub>
                            })}
                        </MenuContent>
                    </MenuPortal>
                </Menu>
            ) : <></>}
            {
                (children ?? null as unknown as ReactElement<any>)
            }
            <Button paddingSize={"xxs"} tabIndex={-1} onClick={(event) => {
                event.stopPropagation()
                event.preventDefault()
                onSelect?.(null)
            }}>
                <IconX size={13}/>
            </Button>
        </ButtonGroup>
    </>

}
