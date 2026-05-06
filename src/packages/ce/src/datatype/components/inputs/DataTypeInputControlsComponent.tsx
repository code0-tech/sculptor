import {LiteralValue, NodeFunction, ReferenceValue} from "@code0-tech/sagittarius-graphql-types";
import React from "react";
import {IconVariable, IconX} from "@tabler/icons-react";
import {ReferenceBadgeComponent} from "@edition/datatype/components/badges/ReferenceBadgeComponent";
import {ButtonGroup, Menu, MenuTrigger, Button, MenuPortal, MenuContent, MenuItem, Flex} from "@code0-tech/pictor"

export interface DataTypeInputControlsComponentProps {
    suggestions?: (NodeFunction | ReferenceValue | LiteralValue)[]
    onSelect?: (value: NodeFunction | ReferenceValue | LiteralValue | undefined) => void
}

export const DataTypeInputControlsComponent: React.FC<DataTypeInputControlsComponentProps> = (props) => {

    const {suggestions, onSelect} = props

    return (suggestions?.length ?? 0) > 0 ? (
        <ButtonGroup color={"primary"}>
            <Menu>
                <MenuTrigger asChild>
                    <Button paddingSize={"xxs"}>
                        <IconVariable size={13}/>
                    </Button>
                </MenuTrigger>
                <MenuPortal>
                    <MenuContent>
                        {suggestions?.map((suggest, index) => {
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
                        })}
                    </MenuContent>
                </MenuPortal>
            </Menu>
            <Button paddingSize={"xxs"} onClick={() => {
                onSelect?.(undefined)
            }}>
                <IconX size={13}/>
            </Button>
        </ButtonGroup>
    ) : (
        <Button color={"primary"} paddingSize={"xxs"} onClick={() => {
            onSelect?.(undefined)
        }}>
            <IconX size={13}/>
        </Button>
    )

}