import {
    LiteralValue,
    NodeFunction,
    ReferencePath,
    ReferenceValue,
    SubFlowValue
} from "@code0-tech/sagittarius-graphql-types";
import React from "react";
import {IconChevronRight, IconVariable, IconX} from "@tabler/icons-react";
import {ReferenceBadgeComponent} from "@edition/datatype/components/badges/ReferenceBadgeComponent";
import {
    Button,
    ButtonGroup,
    Flex,
    Menu,
    MenuContent,
    MenuItem,
    MenuPortal,
    MenuSub,
    MenuSubContent,
    MenuSubTrigger,
    MenuTrigger,
    ScrollArea,
    ScrollAreaScrollbar,
    ScrollAreaThumb,
    ScrollAreaViewport,
    Text,
    Tooltip,
    TooltipContent,
    TooltipPortal,
    TooltipTrigger
} from "@code0-tech/pictor"
import {NodeBadgeComponent} from "@edition/datatype/components/badges/NodeBadgeComponent";

export interface DataTypeInputControlsComponentProps {
    suggestions?: (NodeFunction | SubFlowValue | ReferenceValue | LiteralValue)[]
    onSelect?: (value: NodeFunction | SubFlowValue | ReferenceValue | LiteralValue | null) => void
    showSuggestions?: boolean
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
    | { kind: "value", value: LiteralValue | SubFlowValue }
    | { kind: "reference-group", key: string, group: ReferenceGroup }

const referenceGroupKey = (value: ReferenceValue): string => {
    return [value.nodeFunctionId, value.inputTypeIdentifier, value.inputIndex, value.parameterIndex].join("/")
}

const referencePathLabel = (path: ReferencePath): string => {
    return `${path.path ?? ""}${path.arrayIndex != null ? `[${path.arrayIndex}]` : ""}`
}

const MenuScrollArea: React.FC<React.PropsWithChildren> = ({children}) => {
    const contentRef = React.useRef<HTMLDivElement>(null)
    const [height, setHeight] = React.useState<number>()

    React.useLayoutEffect(() => {
        const el = contentRef.current
        if (!el) return
        const observer = new ResizeObserver((entries) => {
            const entry = entries[0]
            if (entry) setHeight(entry.contentRect.height)
        })
        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    return <ScrollArea mah={"calc(var(--radix-popper-available-height) - 0rem)"}
                       h={height !== undefined ? `${height}px` : undefined}>
        <ScrollAreaViewport>
            <div ref={contentRef}>
                {children}
            </div>
        </ScrollAreaViewport>
        <ScrollAreaScrollbar orientation={"vertical"}>
            <ScrollAreaThumb/>
        </ScrollAreaScrollbar>
    </ScrollArea>
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
                    <MenuScrollArea>
                        {node.value ? (
                            <MenuItem onSelect={() => onSelect?.(node.value!)}>
                                {node.label}
                            </MenuItem>
                        ) : null}
                        <ReferencePathMenuItems nodes={node.children} onSelect={onSelect}/>
                    </MenuScrollArea>
                </MenuSubContent>
            </MenuSub>
        })}
    </>
}

export const DataTypeInputControlsComponent: React.FC<DataTypeInputControlsComponentProps> = (props) => {

    const {suggestions, showSuggestions = true, onSelect} = props

    const menuEntries = React.useMemo(() => {
        if (!suggestions) return []

        const entries: MenuEntry[] = []
        const groups = new Map<string, ReferenceGroup>()

        suggestions.forEach(suggest => {
            if (suggest.__typename === "LiteralValue" || suggest.__typename === "SubFlowValue") {
                entries.push({kind: "value", value: suggest})
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
    }, [suggestions])

    return <ButtonGroup color={"primary"}>
        {showSuggestions ? (
            <Menu>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <MenuTrigger asChild disabled={menuEntries.length <= 0}>
                            <Button paddingSize={"xxs"}>
                                <IconVariable size={13}/>
                            </Button>
                        </MenuTrigger>
                    </TooltipTrigger>
                    <TooltipPortal>
                        <TooltipContent side={"top"} sideOffset={8}>
                            {menuEntries.length <= 0 ? <Text>
                                No suggestion available
                            </Text> : <Text>
                                Suggestions for this parameter
                            </Text>}
                        </TooltipContent>
                    </TooltipPortal>
                </Tooltip>
                <MenuPortal>
                    <MenuContent align={"center"} alignOffset={0} sideOffset={0}>
                        <MenuScrollArea>
                            {menuEntries.map((entry, index) => {
                                if (entry.kind === "value" && entry.value.__typename === "LiteralValue") {
                                    return <MenuItem key={index} onSelect={() => onSelect?.(entry.value)}>
                                        <Flex style={{gap: "0.35rem"}} align={"center"}>
                                            {entry.value.value.toString()}
                                        </Flex>
                                    </MenuItem>
                                }

                                if (entry.kind === "value" && entry.value.__typename === "SubFlowValue") {
                                    return <MenuItem key={index} onSelect={() => onSelect?.(entry.value)}>
                                        <NodeBadgeComponent value={entry.value}/>
                                    </MenuItem>
                                }

                                if (entry.kind === "reference-group") {
                                    const group = entry.group

                                    if (group.suggestions.length === 1) {
                                        return <MenuItem key={entry.key}
                                                         onSelect={() => onSelect?.(group.suggestions[0])}>
                                            <ReferenceBadgeComponent value={group.suggestions[0]}/>
                                        </MenuItem>
                                    }

                                    return <MenuSub key={entry.key}>
                                        <MenuSubTrigger>
                                            <Flex align={"center"} justify={"space-between"} style={{gap: "0.7rem"}}
                                                  w={"100%"}>
                                                <ReferenceBadgeComponent value={group.root}/>
                                                <IconChevronRight size={12}/>
                                            </Flex>
                                        </MenuSubTrigger>
                                        <MenuSubContent>
                                            <MenuScrollArea>
                                                {group.value ? (
                                                    <MenuItem onSelect={() => onSelect?.(group.value!)}>
                                                        <ReferenceBadgeComponent value={group.value}/>
                                                    </MenuItem>
                                                ) : null}
                                                <ReferencePathMenuItems nodes={group.children} onSelect={onSelect}/>
                                            </MenuScrollArea>
                                        </MenuSubContent>
                                    </MenuSub>
                                }

                                return null
                            })}
                        </MenuScrollArea>
                    </MenuContent>
                </MenuPortal>
            </Menu>
        ) : <></>}
        <Button paddingSize={"xxs"} onClick={(event) => {
            onSelect?.(null)
            event.stopPropagation()
            event.preventDefault()
        }}>
            <IconX size={13}/>
        </Button>
    </ButtonGroup>

}
