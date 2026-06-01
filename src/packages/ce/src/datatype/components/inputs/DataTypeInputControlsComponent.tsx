import {LiteralValue, NodeFunction, ReferenceValue, SubFlowValue} from "@code0-tech/sagittarius-graphql-types";
import React from "react";
import {IconVariable, IconX} from "@tabler/icons-react";
import {ReferenceBadgeComponent} from "@edition/datatype/components/badges/ReferenceBadgeComponent";
import {
    Button,
    ButtonGroup,
    Flex,
    Menu,
    MenuContent,
    MenuItem,
    MenuPortal,
    MenuTrigger,
    Text,
    Tooltip,
    TooltipContent,
    TooltipPortal,
    TooltipTrigger
} from "@code0-tech/pictor"
import {NodeBadgeComponent} from "@edition/datatype/components/badges/NodeBadgeComponent";

export interface DataTypeInputControlsComponentProps {
    suggestions?: (NodeFunction | SubFlowValue | ReferenceValue | LiteralValue)[]
    onSelect?: (value: NodeFunction | SubFlowValue | ReferenceValue | LiteralValue | undefined) => void
    showSuggestions?: boolean
}

export const DataTypeInputControlsComponent: React.FC<DataTypeInputControlsComponentProps> = (props) => {

    const {suggestions, showSuggestions = true, onSelect} = props

    const filteredSuggestions = React.useMemo(() => {
        if (!suggestions) return []
        return suggestions.filter(suggest => suggest.__typename === "LiteralValue" || suggest.__typename === "ReferenceValue" || suggest.__typename === "SubFlowValue")
    }, [suggestions])

    return <ButtonGroup color={"primary"}>
        {showSuggestions ? (
            <Menu>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <MenuTrigger asChild disabled={filteredSuggestions.length <= 0}>
                            <Button paddingSize={"xxs"}>
                                <IconVariable size={13}/>
                            </Button>
                        </MenuTrigger>
                    </TooltipTrigger>
                    <TooltipPortal>
                        <TooltipContent side={"top"} sideOffset={8}>
                            {filteredSuggestions.length <= 0 ? <Text>
                                No suggestion available
                            </Text> : <Text>
                                Suggestions for this parameter
                            </Text>}
                        </TooltipContent>
                    </TooltipPortal>
                </Tooltip>
                <MenuPortal>
                    <MenuContent>
                        {filteredSuggestions?.map((suggest, index) => {
                            if (suggest.__typename === "LiteralValue") {
                                return <MenuItem onSelect={() => onSelect?.(suggest)}>
                                    <Flex style={{gap: "0.35rem"}} align={"center"}>
                                        {(suggest)?.value.toString()}
                                    </Flex>
                                </MenuItem>
                            }

                            if (suggest.__typename === "ReferenceValue") {
                                return <MenuItem onSelect={() => onSelect?.(suggest)}>
                                    <ReferenceBadgeComponent value={suggest}/>
                                </MenuItem>
                            }

                            if (suggest.__typename === "SubFlowValue") {
                                console.log(suggest)
                                return <MenuItem onSelect={() => onSelect?.(suggest)}>
                                    <NodeBadgeComponent value={suggest}/>
                                </MenuItem>
                            }
                        })}
                    </MenuContent>
                </MenuPortal>
            </Menu>
        ) : <></>}
        <Button paddingSize={"xxs"} onClick={(event) => {
            onSelect?.(undefined)
            event.stopPropagation()
            event.preventDefault()
        }}>
            <IconX size={13}/>
        </Button>
    </ButtonGroup>

}