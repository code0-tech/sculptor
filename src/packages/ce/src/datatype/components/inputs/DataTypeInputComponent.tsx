import React from "react";
import {DataTypeTextInputComponent} from "./text/DataTypeTextInputComponent";
import {InputProps} from "@code0-tech/pictor";
import {DataTypeJSONInputComponent} from "@edition/datatype/components/inputs/json/DataTypeJSONInputComponent";
import {NodeSchema} from "@code0-tech/triangulum";

export interface DataTypeInputComponentProps extends Omit<InputProps<any | null>, "wrapperComponent" | "type"> {
    schema: NodeSchema
    clearable?: boolean
    onClear?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

export const DataTypeInputComponent: React.FC<DataTypeInputComponentProps> = (props) => {

    const {schema, ...rest} = props

    switch (schema.schema.input) {
        case "data":
        case "list":
            return <DataTypeJSONInputComponent
                schema={schema}
                {...rest}
            />
        default:
            return <DataTypeTextInputComponent
                schema={schema}
                {...rest}
            />
    }
}