import React from "react";
import {DataTypeInputComponentProps} from "@edition/datatype/components/inputs/DataTypeInputComponent";
import {
    Button,
    Flex,
    InputDescription,
    InputLabel,
    Menu,
    MenuContent,
    MenuItem,
    MenuPortal,
    MenuTrigger,
    SegmentedControl,
    SegmentedControlItem,
    Text
} from "@code0-tech/pictor";
import {NodeBadgeComponent} from "@edition/datatype/components/badges/NodeBadgeComponent";
import {ReferenceBadgeComponent} from "@edition/datatype/components/badges/ReferenceBadgeComponent";
import {ButtonGroup} from "@code0-tech/pictor/dist/components/button-group/ButtonGroup";
import {IconVariable, IconX} from "@tabler/icons-react";
import {InputWrapper} from "@code0-tech/pictor/dist/components/form/InputWrapper";
import {useDebouncedCallback} from "use-debounce";
import {LiteralValue} from "@code0-tech/sagittarius-graphql-types";

export type DataTypeBooleanInputComponentProps = DataTypeInputComponentProps

export const DataTypeBooleanInputComponent: React.FC<DataTypeBooleanInputComponentProps> = (props) => {

    const {suggestions, initialValue, title, description, formValidation, onChange} = props

    const onChangeDebounced = useDebouncedCallback((value: string | undefined) => {

        const boolValue: LiteralValue | undefined = value && ["true", "false"].includes(value) ? {
            __typename: "LiteralValue",
            value: value === "true"
        } : undefined

        formValidation?.setValue?.(boolValue)
        onChange?.(boolValue)
    }, 200)

    return React.useMemo(() => <>
        <InputLabel>{title}</InputLabel>
        <InputDescription>{description}</InputDescription>
        <InputWrapper formValidation={{...formValidation, setValue: undefined}} right={
            (suggestions?.length ?? 0) > 0 ? (
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
                                        return <MenuItem>
                                            <Flex style={{gap: "0.35rem"}} align={"center"}>
                                                {(suggest)?.value.toString()}
                                            </Flex>
                                        </MenuItem>
                                    }

                                    if (suggest.__typename === "ReferenceValue") {
                                        return <MenuItem>
                                            <ReferenceBadgeComponent value={suggest}/>
                                        </MenuItem>
                                    }
                                })}
                            </MenuContent>
                        </MenuPortal>
                    </Menu>
                    <Button paddingSize={"xxs"} onClick={() => {
                        onChangeDebounced(undefined)
                    }}>
                        <IconX size={13}/>
                    </Button>
                </ButtonGroup>
            ) : (
                <Button color={"primary"} paddingSize={"xxs"} onClick={() => {
                    onChangeDebounced(undefined)
                }}>
                    <IconX size={13}/>
                </Button>
            )
        } rightType={"action"}>
            {initialValue?.__typename === "NodeFunction" || initialValue?.__typename === "NodeFunctionIdWrapper" ? (
                <NodeBadgeComponent value={initialValue}/>
            ) : initialValue?.__typename === "ReferenceValue" ? (
                <ReferenceBadgeComponent value={initialValue}/>
            ) : (
                <div style={{alignSelf: "stretch", flex: "1 1 auto", padding: "0.175rem 0 0.175rem 0.175rem"}}>
                    <SegmentedControl type={"single"}
                                      h={"100%"}
                                      bg={"transparent"}
                                      style={{boxShadow: "none"}}
                                      value={(initialValue as LiteralValue)?.value?.toString() ?? ""}
                                      onValueChange={onChangeDebounced}>
                        <SegmentedControlItem w={"100%"} value={"true"}>
                            True
                        </SegmentedControlItem>
                        <SegmentedControlItem w={"100%"} value={"false"}>
                            False
                        </SegmentedControlItem>
                    </SegmentedControl>
                </div>
            )}
        </InputWrapper>
    </>, [formValidation, initialValue])

}