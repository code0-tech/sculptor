import React from "react";
import {DataTypeInputComponentProps} from "@edition/datatype/components/inputs/DataTypeInputComponent";
import {InputDescription, InputLabel, SegmentedControl, SegmentedControlItem} from "@code0-tech/pictor";
import {useDebouncedCallback} from "use-debounce";
import {LiteralValue, NodeFunction, ReferenceValue, SubFlowValue} from "@code0-tech/sagittarius-graphql-types";
import {DataTypeInputValueComponent} from "@edition/datatype/components/inputs/DataTypeInputValueComponent";

export type DataTypeBooleanInputComponentProps = DataTypeInputComponentProps

export const DataTypeBooleanInputComponent: React.FC<DataTypeBooleanInputComponentProps> = (props) => {

    const {suggestions, initialValue, title, description, formValidation, onChange} = props

    const onChangeDebounced = useDebouncedCallback((value: string | LiteralValue | NodeFunction | SubFlowValue | ReferenceValue | undefined) => {

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
        <DataTypeInputValueComponent inside initialValue={initialValue} onChange={onChangeDebounced}
                                     suggestions={suggestions} formValidation={formValidation}>
            <SegmentedControl type={"single"}
                              h={"100%"}
                              ml={-0.35}
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
        </DataTypeInputValueComponent>
    </>, [formValidation, initialValue])

}