import React from "react";
import {Button, Flex, Menu, MenuContent, MenuItem, MenuPortal, MenuTrigger, Text} from "@code0-tech/pictor";
import {IconPlus} from "@tabler/icons-react";

export interface FunctionFileOptionalInputMenuComponentProps {
    label: string
    items: { id: string, title: string, description: string }[]
    onAdd: (id: string) => void
}

export const FunctionFileOptionalInputMenuComponent: React.FC<FunctionFileOptionalInputMenuComponentProps> = (props) => {

    const {label, items, onAdd} = props

    if (items.length === 0) return null

    return <Menu>
        <MenuTrigger asChild>
            <Button data-qa-selector={"flow-builder-optional-input-menu"} w={"100%"} color={"secondary"}
                    paddingSize={"xs"}>
                <Flex align={"center"} justify={"center"} w={"100%"} style={{gap: "0.35rem"}}>
                    <IconPlus size={13}/>
                    <Text>{label}</Text>
                </Flex>
            </Button>
        </MenuTrigger>
        <MenuPortal>
            <MenuContent align={"start"} sideOffset={4} collisionPadding={16} style={{
                width: "var(--radix-popper-anchor-width)",
                maxWidth: "var(--radix-popper-anchor-width)",
                maxHeight: "var(--radix-popper-available-height)",
                overflowY: "auto"
            }}>
                {items.map(item => (
                    <MenuItem key={item.id}
                              data-qa-selector={"flow-builder-optional-input-menu-item"}
                              style={{width: "auto", alignSelf: "stretch", minWidth: 0}}
                              onSelect={() => onAdd(item.id)}>
                        <Flex style={{flexDirection: "column", gap: "0.1rem", minWidth: 0, overflow: "hidden"}}>
                            <Text style={{overflowWrap: "anywhere"}}>{item.title}</Text>
                            <Text hierarchy={"tertiary"} style={{overflowWrap: "anywhere"}}>{item.description}</Text>
                        </Flex>
                    </MenuItem>
                ))}
            </MenuContent>
        </MenuPortal>
    </Menu>
}
