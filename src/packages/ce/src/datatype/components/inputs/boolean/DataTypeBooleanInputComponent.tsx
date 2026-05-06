import React from "react";
import {DataTypeInputComponentProps} from "@edition/datatype/components/inputs/DataTypeInputComponent";
import {InputDescription, InputLabel, SegmentedControl, SegmentedControlItem} from "@code0-tech/pictor";
import {NodeBadgeComponent} from "@edition/datatype/components/badges/NodeBadgeComponent";
import {ReferenceBadgeComponent} from "@edition/datatype/components/badges/ReferenceBadgeComponent";
import {InputWrapper} from "@code0-tech/pictor/dist/components/form/InputWrapper";
import {useDebouncedCallback} from "use-debounce";
import {LiteralValue, NodeFunction, ReferenceValue} from "@code0-tech/sagittarius-graphql-types";
import {DataTypeInputControlsComponent} from "@edition/datatype/components/inputs/DataTypeInputControlsComponent";

export type DataTypeBooleanInputComponentProps = DataTypeInputComponentProps

export const DataTypeBooleanInputComponent: React.FC<DataTypeBooleanInputComponentProps> = (props) => {

    const {suggestions, initialValue, title, description, formValidation, onChange} = props

    const onChangeDebounced = useDebouncedCallback((value: string | LiteralValue | NodeFunction | ReferenceValue | undefined) => {

        if (typeof value === "string") {
            const boolValue: LiteralValue | undefined = value && ["true", "false"].includes(value) ? {
                __typename: "LiteralValue",
                value: value === "true"
            } : undefined

            formValidation?.setValue?.(boolValue)
            onChange?.(boolValue)
        } else {
            formValidation?.setValue?.(value)
            onChange?.(value)
        }

    }, 200)

    return React.useMemo(() => <>
        <InputLabel>{title}</InputLabel>
        <InputDescription>{description}</InputDescription>
        <InputWrapper formValidation={{...formValidation, setValue: undefined}} right={
            <DataTypeInputControlsComponent suggestions={suggestions} onSelect={onChangeDebounced}/>
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