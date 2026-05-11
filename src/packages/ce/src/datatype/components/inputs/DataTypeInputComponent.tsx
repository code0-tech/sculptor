import React from "react";
import {DataTypeTextInputComponent} from "./text/DataTypeTextInputComponent";
import {NodeSchema} from "@code0-tech/triangulum";
import {LiteralValue, NodeFunction, NodeParameterValue, ReferenceValue} from "@code0-tech/sagittarius-graphql-types";
import {DataTypeBooleanInputComponent} from "@edition/datatype/components/inputs/boolean/DataTypeBooleanInputComponent";
import {DataTypeSelectInputComponent} from "@edition/datatype/components/inputs/select/DataTypeSelectInputComponent";
import {InputWrapperProps} from "@code0-tech/pictor/dist/components/form/InputWrapper";
import {DataTypeNumberInputComponent} from "@edition/datatype/components/inputs/number/DataTypeNumberInputComponent";
import {DataTypeJSONInputComponent} from "@edition/datatype/components/inputs/json/DataTypeJSONInputComponent";
import {DataTypeGenericInputComponent} from "@edition/datatype/components/inputs/generic/DataTypeGenericInputComponent";

export interface DataTypeInputComponentProps extends Omit<InputWrapperProps<NodeParameterValue | NodeFunction>, "wrapperComponent" | "onChange"> {
    schema: NodeSchema
    clearable?: boolean
    onChange?: (value: ReferenceValue | LiteralValue | NodeFunction | undefined) => void
    suggestions?: (NodeFunction | ReferenceValue | LiteralValue)[]
    onClear?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

export const DataTypeInputComponent: React.FC<DataTypeInputComponentProps> = (props) => {

    const {schema, ...rest} = props

    const suggestions = schema?.schema?.suggestions as (NodeFunction | ReferenceValue | LiteralValue)[]
    const inputName = schema?.schema?.input === "generic" ? schema.functionSchema.input : schema?.schema?.input

    switch (inputName) {
        case "boolean":
            return <DataTypeBooleanInputComponent
                schema={schema}
                suggestions={suggestions}
                {...rest}
            />
        case "select":
            return <DataTypeSelectInputComponent
                schema={schema}
                suggestions={suggestions}
                {...rest}/>
        case "number":
            return <DataTypeNumberInputComponent
                schema={schema}
                suggestions={suggestions}
                {...rest}/>
        case "list":
        case "data":
            return <DataTypeJSONInputComponent
                schema={schema}
                suggestions={suggestions}
                {...rest}/>
        case "generic":
            return <DataTypeGenericInputComponent
                schema={schema}
                suggestions={suggestions}
                {...rest}/>
        default:
            return <DataTypeTextInputComponent
                suggestions={suggestions}
                schema={schema}
                {...rest}
            />
    }
}