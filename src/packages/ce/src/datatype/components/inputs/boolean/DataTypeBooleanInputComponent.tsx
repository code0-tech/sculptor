import React from "react";
import {DataTypeInputComponentProps} from "@edition/datatype/components/inputs/DataTypeInputComponent";
import {Button, InputDescription, InputLabel, SegmentedControl, SegmentedControlItem} from "@code0-tech/pictor";
import {NodeBadgeComponent} from "@edition/datatype/components/badges/NodeBadgeComponent";
import {ReferenceBadgeComponent} from "@edition/datatype/components/badges/ReferenceBadgeComponent";
import {ButtonGroup} from "@code0-tech/pictor/dist/components/button-group/ButtonGroup";
import {IconVariable, IconX} from "@tabler/icons-react";
import {InputWrapper} from "@code0-tech/pictor/dist/components/form/InputWrapper";
import {useDebouncedCallback} from "use-debounce";

export type DataTypeBooleanInputComponentProps = DataTypeInputComponentProps

export const DataTypeBooleanInputComponent: React.FC<DataTypeBooleanInputComponentProps> = (props) => {

    const {suggestions, initialValue, title, description, formValidation, onChange} = props

    const defaultValue = React.useMemo(() => typeof initialValue === "boolean" ? (initialValue ? "true" : "false") : undefined , [])
    const onChangeDebounced = useDebouncedCallback(() => {
        onChange?.({} as any)
    }, 200)

    console.log("booldefault", defaultValue)

    return React.useMemo(() => <>
        <InputLabel>{title}</InputLabel>
        <InputDescription>{description}</InputDescription>
        <InputWrapper formValidation={formValidation} right={
            (suggestions?.length ?? 0) > 0 ? (
                <ButtonGroup bg={"transparent"}>
                    <Button color={"primary"} paddingSize={"xxs"}>
                        <IconVariable size={13}/>
                    </Button>
                    <Button color={"primary"} paddingSize={"xxs"}>
                        <IconX size={13}/>
                    </Button>
                </ButtonGroup>
            ) : (
                <Button color={"primary"} paddingSize={"xxs"}>
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
                                      defaultValue={defaultValue}
                                      onValueChange={(value) => {
                                          formValidation?.setValue(value)
                                          onChangeDebounced()
                                      }}>
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