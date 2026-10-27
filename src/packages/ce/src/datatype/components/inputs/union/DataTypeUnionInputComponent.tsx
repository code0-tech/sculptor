import React from "react";
import {
    DataTypeInputComponent,
    DataTypeInputComponentProps
} from "@edition/datatype/components/inputs/DataTypeInputComponent";
import {ButtonGroup} from "@code0-tech/pictor/dist/components/button-group/ButtonGroup";
import {Button, InputDescription, InputLabel, InputMessage} from "@code0-tech/pictor";
import {NodeSchema, Schema, UnionInput} from "@code0-tech/triangulum";

export type DataTypeUnionInputComponentProps = DataTypeInputComponentProps

export const DataTypeUnionInputComponent: React.FC<DataTypeUnionInputComponentProps> = (props) => {

    const {schema, title, description, formValidation, suggestions, ...rest} = props

    const items = React.useMemo(() => {
        const inner = (schema && "schema" in schema ? (schema as NodeSchema).schema : schema) as UnionInput | undefined
        return inner?.items ?? []
    }, [schema])

    const isStructural = (item: Schema) => item.input === "data" || (item.input ?? "").startsWith("list")

    const [picked, setPicked] = React.useState(
        items.some(isStructural) ? items.findIndex(item => !isStructural(item)) : -1
    )

    if (picked >= 0 && items[picked]) {
        return <DataTypeInputComponent
            schema={items[picked]}
            title={title}
            description={description}
            formValidation={formValidation}
            {...rest}/>
    }

    return <>
        {title && <InputLabel>{title}</InputLabel>}
        {description && <InputDescription>{description}</InputDescription>}
        <ButtonGroup w={"100%"} color={"secondary"}>
            {items.map((item, index) => (
                <Button key={index} w={"100%"} style={{flex: "1 1 auto"}} color={"tertiary"}
                        onClick={() => setPicked(index)}>
                    {`${(item.input ?? "generic").replace(/-/g, " ").replace(/\b\w/g, character => character.toUpperCase())} Value`}
                </Button>
            ))}
        </ButtonGroup>
        {!formValidation?.valid && formValidation?.notValidMessage && (
            <InputMessage>{formValidation.notValidMessage}</InputMessage>
        )}
    </>

}
