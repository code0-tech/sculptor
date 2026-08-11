import React from "react";
import {DataTypeInputComponentProps} from "../DataTypeInputComponent";
import {
    Button,
    DateInput,
    DateInputContent,
    DateInputControl,
    DateInputField,
    DateInputTrigger,
    InputDescription,
    InputLabel
} from "@code0-tech/pictor";
import {IconCalendar} from "@tabler/icons-react";
import {fromDate} from "@internationalized/date";
import {useDebouncedCallback} from "use-debounce";
import {
    LiteralValue,
    NodeFunction,
    NodeParameterValue,
    ReferenceValue,
    SubFlowValue
} from "@code0-tech/sagittarius-graphql-types";
import {DataTypeInputControlsComponent} from "@edition/datatype/components/inputs/DataTypeInputControlsComponent";
import {DataTypeInputValueComponent} from "@edition/datatype/components/inputs/DataTypeInputValueComponent";

export type DataTypeDateInputComponentProps = DataTypeInputComponentProps

export const DataTypeDateInputComponent: React.FC<DataTypeDateInputComponentProps> = (props) => {

    const {formValidation, title, initialValue, description, suggestions, onChange} = props

    const defaultValue: NodeParameterValue | NodeFunction | undefined = React.useMemo(() => initialValue ?? undefined, [initialValue])
    const onChangeDebounced = useDebouncedCallback((value: number | LiteralValue | SubFlowValue | NodeFunction | ReferenceValue | null) => {
        if (typeof value === "number") {
            onChange?.({__typename: "LiteralValue", value})
        } else {
            onChange?.(value)
        }
    }, 400)

    return React.useMemo(() => <>
        <InputLabel>{title}</InputLabel>
        <InputDescription>{description}</InputDescription>
        <DataTypeInputValueComponent initialValue={initialValue} onChange={value => {
            formValidation?.setValue?.(value)
            onChangeDebounced(value)
        }} suggestions={suggestions}
                                     formValidation={formValidation}>
            <DateInput value={typeof (defaultValue as LiteralValue)?.value === "number"
                ? fromDate(new Date((defaultValue as LiteralValue).value as number * 1000), "UTC")
                : null}
                       granularity={"second"}
                       locale={"de-DE"}
                       closeOnSelect={false}
                       formValidation={{
                           ...formValidation,
                           setValue: (value) => {
                               const literal: LiteralValue | null = value == null ? null : {
                                   __typename: "LiteralValue",
                                   value: value as number
                               }
                               formValidation?.setValue?.(literal)
                               onChangeDebounced(value as number | null)
                           }
                       }}
                       maw={"100%"}
                       right={
                           <DataTypeInputControlsComponent suggestions={suggestions} onSelect={value => {
                               formValidation?.setValue?.(value)
                               onChangeDebounced(value)
                           }}>
                               <DateInputTrigger asChild>
                                   <Button paddingSize={"xxs"}>
                                       <IconCalendar size={13}/>
                                   </Button>
                               </DateInputTrigger>
                           </DataTypeInputControlsComponent>
                       }
                       rightType={"action"}>
                <DateInputControl>
                    <DateInputField fz={0.8}/>
                </DateInputControl>
                <DateInputContent withTime/>
            </DateInput>
        </DataTypeInputValueComponent>
    </>, [formValidation, defaultValue])
}
