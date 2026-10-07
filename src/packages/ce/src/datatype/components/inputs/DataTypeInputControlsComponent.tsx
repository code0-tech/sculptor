import {Flow, NodeFunction} from "@code0-tech/sagittarius-graphql-types";
import React, {ReactElement} from "react";
import {IconVariable, IconX} from "@tabler/icons-react";
import {useParams} from "next/navigation";
import {useFlowReferenceHoverStore} from "@edition/flow/hooks/Flow.reference.hover.hook";
import {
    Button,
    ButtonGroup,
    ButtonProps,
    Menu,
    MenuContent,
    MenuPortal,
    MenuTrigger,
    Text,
    Tooltip,
    TooltipContent,
    TooltipPortal,
    TooltipTrigger
} from "@code0-tech/pictor"
import {
    Suggestion,
    SuggestionValue,
    useSuggestionMenuEntries
} from "@edition/function/components/suggestion/Suggestion.util";
import {
    SuggestionVariantDialogComponent
} from "@edition/function/components/suggestion/SuggestionVariantDialogComponent";
import {
    DataTypeInputMenuSuggestionsComponent
} from "@edition/datatype/components/inputs/DataTypeInputMenuSuggestionsComponent";

export interface DataTypeInputControlsComponentProps {
    suggestions?: SuggestionValue[]
    nodeId?: NodeFunction['id']
    parameterIndex?: number
    onSelect?: (value: SuggestionValue | null) => void
    onCustomLogicGroupSelect?: () => void
    showSuggestions?: boolean
    children?: React.ReactElement<ButtonProps>
}

export const DataTypeInputControlsComponent: React.FC<DataTypeInputControlsComponentProps> = (props) => {

    const {suggestions, nodeId, parameterIndex, showSuggestions = true, onSelect, onCustomLogicGroupSelect, children} = props

    const params = useParams()
    const flowId: Flow['id'] = `gid://sagittarius/Flow/${Number(params.flowId) || 1}`
    const setHoveredNodeId = useFlowReferenceHoverStore(state => state.setHoveredNodeId)
    const [variantSuggestion, setVariantSuggestion] = React.useState<Suggestion | null>(null)

    const {entries, moduleGroups} = useSuggestionMenuEntries(suggestions ?? [], flowId)

    const hasSuggestions = entries.length > 0 || moduleGroups.length > 0 || !!onCustomLogicGroupSelect

    const groupChildren = [
        showSuggestions && hasSuggestions ? (
            <Menu key={"suggestions"} onOpenChange={(open) => {
                if (!open) setHoveredNodeId(null)
            }}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <MenuTrigger asChild>
                            <Button paddingSize={"xxs"}>
                                <IconVariable size={13}/>
                            </Button>
                        </MenuTrigger>
                    </TooltipTrigger>
                    <TooltipPortal>
                        <TooltipContent side={"top"} sideOffset={8}>
                            <Text>
                                Suggestions for this parameter
                            </Text>
                        </TooltipContent>
                    </TooltipPortal>
                </Tooltip>
                <MenuPortal>
                    <MenuContent align={"center"} alignOffset={0} sideOffset={0}>
                        <DataTypeInputMenuSuggestionsComponent mode={"menu"}
                                                               suggestions={suggestions ?? []}
                                                               flowId={flowId}
                                                               nodeId={nodeId}
                                                               parameterIndex={parameterIndex}
                                                               onCustomLogicGroupSelect={onCustomLogicGroupSelect}
                                                               onVariantRequest={setVariantSuggestion}
                                                               onSelect={onSelect}/>
                    </MenuContent>
                </MenuPortal>
            </Menu>
        ) : null,
        children,
        <Button key={"clear"} paddingSize={"xxs"} tabIndex={-1} onClick={(event) => {
            event.stopPropagation()
            event.preventDefault()
            onSelect?.(null)
        }}>
            <IconX size={13}/>
        </Button>
    ].filter(Boolean) as ReactElement<ButtonProps>[]

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
            {groupChildren}
        </ButtonGroup>
    </>
}
