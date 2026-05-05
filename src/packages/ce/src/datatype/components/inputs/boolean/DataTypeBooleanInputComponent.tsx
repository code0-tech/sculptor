import React from "react";
import {DataTypeInputComponentProps} from "@edition/datatype/components/inputs/DataTypeInputComponent";
import {Button, InputDescription, InputLabel, SegmentedControl, SegmentedControlItem} from "@code0-tech/pictor";
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

    const defaultValue = React.useMemo(() => initialValue, [])
    const onChangeDebounced = useDebouncedCallback((value: string) => {
        formValidation?.setValue?.({
            __typename: "LiteralValue",
            value: value === "true" ? true : value === "false" ? false : undefined
        })
        onChange?.({
            __typename: "LiteralValue",
            value: value === "true" ? true : value === "false" ? false : undefined
        })
    }, 200)

    return React.useMemo(() => <>
        <InputLabel>{title}</InputLabel>
        <InputDescription>{description}</InputDescription>
        <InputWrapper formValidation={{...formValidation, setValue: undefined}} right={
            (suggestions?.length ?? 0) > 0 ? (
                <ButtonGroup color={"primary"}>
                    <Button paddingSize={"xxs"}>
                        <IconVariable size={13}/>
                    </Button>
                    <Button paddingSize={"xxs"}>
                        <IconX size={13}/>
                    </Button>
                </ButtonGroup>
            ) : (
                <Button color={"primary"} paddingSize={"xxs"}>
                    <IconX size={13}/>
                </Button>
            )
        } rightType={"action"}>
            {defaultValue?.__typename === "NodeFunction" || defaultValue?.__typename === "NodeFunctionIdWrapper" ? (
                <NodeBadgeComponent value={defaultValue}/>
            ) : defaultValue?.__typename === "ReferenceValue" ? (
                <ReferenceBadgeComponent value={defaultValue}/>
            ) : (
                <div style={{alignSelf: "stretch", flex: "1 1 auto", padding: "0.175rem 0 0.175rem 0.175rem"}}>
                    <SegmentedControl type={"single"}
                                      h={"100%"}
                                      bg={"transparent"}
                                      style={{boxShadow: "none"}}
                                      defaultValue={(defaultValue as LiteralValue)?.value?.toString() ?? undefined}
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
    </>, [formValidation])

}