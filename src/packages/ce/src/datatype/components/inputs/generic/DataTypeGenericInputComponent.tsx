import {DataTypeInputComponentProps} from "@edition/datatype/components/inputs/DataTypeInputComponent";
import React from "react";
import {ButtonGroup} from "@code0-tech/pictor/dist/components/button-group/ButtonGroup";
import {Button, InputDescription, InputLabel, InputMessage} from "@code0-tech/pictor";
import {useDebouncedCallback} from "use-debounce";
import {LiteralValue, NodeFunction, ReferenceValue} from "@code0-tech/sagittarius-graphql-types";

export type DataTypeGenericInputComponentProps = DataTypeInputComponentProps

export const DataTypeGenericInputComponent: React.FC<DataTypeGenericInputComponentProps> = (props) => {

    const {title, description, onChange, formValidation} = props

    const onChangeDebounced = useDebouncedCallback((value: LiteralValue | NodeFunction | ReferenceValue | null) => {
        onChange?.(value)
    }, 200)

    return <>
        <InputLabel>{title}</InputLabel>
        <InputDescription>{description}</InputDescription>
        <ButtonGroup color={"secondary"}>
            <Button color={"tertiary"} onClick={() => {
                formValidation?.setValue?.({
                    __typename: "LiteralValue", value: 0
                })
                onChangeDebounced({
                    __typename: "LiteralValue", value: 0
                })
            }}>
                Number Value
            </Button>
            <Button color={"tertiary"} onClick={() => {
                formValidation?.setValue?.({
                    __typename: "LiteralValue", value: false
                })
                onChangeDebounced({
                    __typename: "LiteralValue", value: false
                })
            }}>
                Boolean Value
            </Button>
            <Button color={"tertiary"} onClick={() => {
                formValidation?.setValue?.({
                    __typename: "LiteralValue", value: ""
                })
                onChangeDebounced({
                    __typename: "LiteralValue", value: ""
                })
            }}>
                Text Value
            </Button>
            <Button color={"tertiary"} onClick={() => {
                formValidation?.setValue?.({
                    __typename: "LiteralValue", value: []
                })
                onChangeDebounced({
                    __typename: "LiteralValue", value: []
                })
            }}>
                List Value
            </Button>
            <Button color={"tertiary"} onClick={() => {
                formValidation?.setValue?.({
                    __typename: "LiteralValue", value: {}
                })
                onChangeDebounced({
                    __typename: "LiteralValue", value: {}
                })
            }}>
                Data Value
            </Button>
        </ButtonGroup>
        {!formValidation?.valid && formValidation?.notValidMessage && (
            <InputMessage>{formValidation.notValidMessage}</InputMessage>
        )}
    </>

}