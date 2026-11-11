import React from "react";
import {Flow, NodeFunction, ReferenceValue, SubFlowValue} from "@code0-tech/sagittarius-graphql-types";
import {
    Flex,
    Menu,
    MenuContent,
    MenuItem,
    MenuPortal,
    MenuSeparator,
    MenuTrigger,
    TagInputMenu,
    TagInputMenuItem,
    Text,
    Tooltip,
    TooltipContent,
    TooltipPortal,
    TooltipTrigger,
    useService
} from "@code0-tech/pictor";
import {IconPlus} from "@tabler/icons-react";
import {useParams} from "next/navigation";
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
import {DataTypeInputMenuEntriesComponent} from "@edition/datatype/components/inputs/DataTypeInputMenuEntriesComponent";
import {DataTypeInputMenuModuleGroupsComponent} from "@edition/datatype/components/inputs/DataTypeInputMenuModuleGroupsComponent";

export interface DataTypeInputMenuSuggestionsComponentProps {
    suggestions: SuggestionValue[]
    mode?: "tag" | "menu"
    tagKeys?: SuggestionTagKey[]
    customLogicGroupKey?: SuggestionTagKey
    onCustomLogicGroupSelect?: () => void
    flowId?: Flow['id']
    nodeId?: NodeFunction['id']
    parameterIndex?: number
    trigger?: React.ReactElement
    tooltip?: React.ReactNode
    anchor?: {top: number, left: number} | null
    query?: string
    open?: boolean
    onOpenChange?: (open: boolean) => void
    onSelect?: (value: SuggestionValue) => void
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
        trigger,
        tooltip,
        anchor,
        query,
        open,
        onOpenChange,
        onSelect,
        onVariantSelect,
        children
    } = props

    const params = useParams()
    const flowService = useService(FlowService)
    const flowId: Flow['id'] = props.flowId ?? `gid://sagittarius/Flow/${Number(params.flowId) || 1}`
    const setHoveredNodeId = useFlowReferenceHoverStore(state => state.setHoveredNodeId)
    const [variantSuggestion, setVariantSuggestion] = React.useState<Suggestion | null>(null)

    const {entries, moduleGroups} = useSuggestionMenuEntries(suggestions, flowId)

    const hasCustomLogicGroup = mode === "menu" ? !!onCustomLogicGroupSelect : customLogicGroupKey !== undefined
    const needle = (query ?? "").trim().toLowerCase()
    const anchored = mode === "menu" && !trigger && !!open

    React.useEffect(() => {
        if (!anchored) return

        const content = () =>
            document.querySelector<HTMLElement>('[data-suggestion-menu="true"][data-state="open"]')

        const listener = (event: KeyboardEvent) => {
            const element = content()
            if (!element || (document.activeElement as HTMLElement | null)?.closest('[role="menu"]')) return

            const items = Array.from(element.querySelectorAll<HTMLElement>('[role="menuitem"]:not([data-disabled])'))
            if (items.length <= 0) return

            const current = items.findIndex(item => item.dataset.focus === "true")

            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                const next = event.key === "ArrowDown"
                    ? (current + 1) % items.length
                    : (current <= 0 ? items.length - 1 : current - 1)

                event.preventDefault()
                event.stopPropagation()
                items.forEach(item => delete item.dataset.focus)
                items[next].dataset.focus = "true"
                items[next].scrollIntoView({block: "nearest"})
                return
            }

            const opens = event.key === "ArrowRight"
                && items[current]?.getAttribute("aria-haspopup") === "menu"

            if (event.key === "Enter" || opens) {
                event.preventDefault()
                event.stopPropagation()
                items[Math.max(current, 0)].click()
            }
        }

        const frame = requestAnimationFrame(() => {
            const first = content()?.querySelector<HTMLElement>('[role="menuitem"]:not([data-disabled])')

            if (first) first.dataset.focus = "true"
        })

        document.addEventListener("keydown", listener, true)

        return () => {
            cancelAnimationFrame(frame)
            document.removeEventListener("keydown", listener, true)
            content()?.querySelectorAll<HTMLElement>('[role="menuitem"]')
                .forEach(item => delete item.dataset.focus)
        }
    }, [anchored, needle])

    if (React.Children.count(children) <= 0
        && !hasCustomLogicGroup
        && entries.length <= 0
        && moduleGroups.length <= 0) return null

    const matches = (terms: (string | null | undefined)[]): boolean =>
        needle.length <= 0 || terms.some(term => (term ?? "").toLowerCase().includes(needle))

    const matchedEntries = entries.filter(entry => {
        if (entry.kind === "value") {
            const value = entry.value

            if (value.__typename === "LiteralValue") return matches([String(value.value ?? "")])

            const definition = value.__typename === "SubFlowValue" || value.__typename === "NodeFunction"
                ? value.functionDefinition
                : undefined

            return matches([definition?.names?.[0]?.content, definition?.identifier,
                definition?.aliases?.[0]?.content])
        }

        return matches([
            entry.group.displayName,
            entry.group.root.inputTypeIdentifier,
            ...entry.group.suggestions.flatMap(suggestion =>
                (suggestion.value.referencePath ?? []).map(path => path.path))
        ])
    })

    const matchedModuleGroups = moduleGroups.flatMap(group => {
        if (matches([group.displayMessage])) return [group]

        const matched = group.suggestions.filter(suggestion =>
            matches([suggestion.displayMessage, suggestion.definitionSource, ...(suggestion.aliases ?? [])]))

        return matched.length <= 0 ? [] : [{...group, suggestions: matched}]
    })

    const items = <>
        {children}
        {React.Children.count(children) > 0 && (hasCustomLogicGroup || matchedEntries.length > 0 || matchedModuleGroups.length > 0) ?
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
            {matchedEntries.length > 0 || matchedModuleGroups.length > 0 ? <MenuSeparator/> : null}
        </> : null}
        <DataTypeInputMenuEntriesComponent entries={matchedEntries}
                                           mode={mode}
                                           tagKeys={tagKeys}
                                           onSelect={onSelect}/>
        {matchedEntries.length > 0 && matchedModuleGroups.length > 0 ? <MenuSeparator/> : null}
        <DataTypeInputMenuModuleGroupsComponent moduleGroups={matchedModuleGroups}
                                                suggestions={suggestions}
                                                mode={mode}
                                                tagKeys={tagKeys}
                                                onSelect={onSelect}
                                                onVariantRequest={setVariantSuggestion}/>
    </>

    const variantDialog = <SuggestionVariantDialogComponent suggestion={variantSuggestion}
                                                            flowId={flowId}
                                                            nodeId={nodeId}
                                                            parameterIndex={parameterIndex}
                                                            open={!!variantSuggestion}
                                                            onOpenChange={opened => {
                                                                if (!opened) setVariantSuggestion(null)
                                                            }}
                                                            onVariantSelect={picked => {
                                                                setVariantSuggestion(null)

                                                                if (mode === "menu") {
                                                                    onSelect?.(picked)
                                                                    return
                                                                }

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

    if (mode === "menu") {
        const menuTrigger = <MenuTrigger asChild>
            {trigger ?? <span aria-hidden={true}
                              style={{position: "fixed", width: 0, height: 0, pointerEvents: "none",
                                  top: anchor?.top ?? 0, left: anchor?.left ?? 0}}/>}
        </MenuTrigger>

        return <>
            {variantDialog}
            <Menu modal={false} open={open} onOpenChange={opened => {
                if (!opened) setHoveredNodeId(null)
                onOpenChange?.(opened)
            }}>
                {tooltip ? <Tooltip>
                    <TooltipTrigger asChild>
                        {menuTrigger}
                    </TooltipTrigger>
                    <TooltipPortal>
                        <TooltipContent color={"primary"} side={"top"} sideOffset={8} style={{zIndex: 51}}>
                            {tooltip}
                        </TooltipContent>
                    </TooltipPortal>
                </Tooltip> : menuTrigger}
                <MenuPortal>
                    <MenuContent color={"primary"}
                                 data-suggestion-menu={"true"}
                                 align={"start"}
                                 sideOffset={4}
                                 style={{zIndex: 51}}
                                 miw={"220px"}
                                 onKeyDown={event => event.stopPropagation()}
                                 onFocusOutside={event => {
                                     if (!trigger) event.preventDefault()
                                 }}
                                 onInteractOutside={event => {
                                     if (!trigger && event.detail.originalEvent.type === "focusin")
                                         event.preventDefault()
                                 }}
                                 onCloseAutoFocus={event => {
                                     if (!trigger) event.preventDefault()
                                 }}
                                 onMouseLeave={() => setHoveredNodeId(null)}>
                        {needle.length > 0 && matchedEntries.length <= 0 && matchedModuleGroups.length <= 0 ?
                            <MenuItem disabled>
                                <Text hierarchy={"tertiary"}>No matching suggestions</Text>
                            </MenuItem> : items}
                    </MenuContent>
                </MenuPortal>
            </Menu>
        </>
    }

    return <>
        {variantDialog}
        <TagInputMenu openOn={"focus"} onMouseLeave={() => setHoveredNodeId(null)}>{items}</TagInputMenu>
    </>
}
