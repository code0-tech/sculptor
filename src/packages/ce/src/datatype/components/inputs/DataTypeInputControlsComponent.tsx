import {Flow, NodeFunction} from "@code0-tech/sagittarius-graphql-types";
import React, {ReactElement} from "react";
import {IconVariable, IconX} from "@tabler/icons-react";
import {useParams} from "next/navigation";
import {
    Button,
    ButtonGroup,
    ButtonProps,
    Text,
    Tooltip,
    TooltipContent,
    TooltipPortal,
    TooltipTrigger
} from "@code0-tech/pictor"
import {SuggestionValue, useSuggestionMenuEntries} from "@edition/function/components/suggestion/Suggestion.util";
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
    trailing?: React.ReactElement
}

export const DataTypeInputControlsComponent: React.FC<DataTypeInputControlsComponentProps> = (props) => {

    const {
        suggestions,
        nodeId,
        parameterIndex,
        showSuggestions = true,
        onSelect,
        onCustomLogicGroupSelect,
        children,
        trailing
    } = props

    const params = useParams()
    const flowId: Flow['id'] = `gid://sagittarius/Flow/${Number(params.flowId) || 1}`

    const {entries, moduleGroups} = useSuggestionMenuEntries(suggestions ?? [], flowId)

    const hasSuggestions = entries.length > 0 || moduleGroups.length > 0 || !!onCustomLogicGroupSelect

    const groupChildren = [
        showSuggestions && hasSuggestions ? (
            <DataTypeInputMenuSuggestionsComponent key={"suggestions"}
                                                   mode={"menu"}
                                                   suggestions={suggestions ?? []}
                                                   flowId={flowId}
                                                   nodeId={nodeId}
                                                   parameterIndex={parameterIndex}
                                                   onCustomLogicGroupSelect={onCustomLogicGroupSelect}
                                                   onSelect={onSelect}
                                                   tooltip={<Text size={"sm"}>Suggestions for this parameter</Text>}
                                                   trigger={<Button paddingSize={"xxs"}>
                                                       <IconVariable size={13}/>
                                                   </Button>}/>
        ) : null,
        children,
        <Tooltip key={"clear"}>
            <TooltipTrigger asChild>
                <Button paddingSize={"xxs"} tabIndex={-1} onClick={(event) => {
                    event.stopPropagation()
                    event.preventDefault()
                    onSelect?.(null)
                }}>
                    <IconX size={13}/>
                </Button>
            </TooltipTrigger>
            <TooltipPortal>
                <TooltipContent color={"primary"} sideOffset={8} style={{zIndex: 51}}>
                    <Text size={"sm"}>Clear this value</Text>
                </TooltipContent>
            </TooltipPortal>
        </Tooltip>,
        trailing
    ].filter(Boolean) as ReactElement<ButtonProps>[]

    return <ButtonGroup color={"primary"} onClick={event => event.stopPropagation()}>
        {groupChildren}
    </ButtonGroup>
}
