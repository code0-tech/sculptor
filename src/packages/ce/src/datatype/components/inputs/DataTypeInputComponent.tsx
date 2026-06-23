import React from "react";
import {DataTypeTextInputComponent} from "./text/DataTypeTextInputComponent";
import {NodeSchema} from "@code0-tech/triangulum";
import {
    LiteralValue,
    NodeFunction,
    NodeParameterValue,
    ReferenceValue,
    SubFlowValue
} from "@code0-tech/sagittarius-graphql-types";
import {DataTypeBooleanInputComponent} from "@edition/datatype/components/inputs/boolean/DataTypeBooleanInputComponent";
import {DataTypeSelectInputComponent} from "@edition/datatype/components/inputs/select/DataTypeSelectInputComponent";
import {InputWrapperProps} from "@code0-tech/pictor/dist/components/form/InputWrapper";
import {DataTypeNumberInputComponent} from "@edition/datatype/components/inputs/number/DataTypeNumberInputComponent";
import {DataTypeJSONInputComponent} from "@edition/datatype/components/inputs/json/DataTypeJSONInputComponent";
import {DataTypeGenericInputComponent} from "@edition/datatype/components/inputs/generic/DataTypeGenericInputComponent";
import {
    DataTypeSubFlowInputComponent
} from "@edition/datatype/components/inputs/sub-flow/DataTypeSubFlowInputComponent";
import {Schema} from "@code0-tech/triangulum/dist/util/schema.util";

export interface DataTypeInputComponentProps extends Omit<InputWrapperProps<NodeParameterValue | NodeFunction>, "onChange"> {
    schema: (NodeSchema | Schema) & {blocked?: boolean}
    clearable?: boolean
    onChange?: (value: ReferenceValue | SubFlowValue | LiteralValue | NodeFunction | undefined) => void
    suggestions?: (NodeFunction | SubFlowValue | ReferenceValue | LiteralValue)[]
    onClear?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

export const DataTypeInputComponent: React.FC<DataTypeInputComponentProps> = (props) => {

    const {schema, ...rest} = props

    const suggestions = "schema" in schema ? schema?.schema?.suggestions as (NodeFunction | ReferenceValue | LiteralValue)[] : []
    const inputName = "schema" in schema ? (schema?.schema?.input === "generic" ? schema.functionSchema.input : schema?.schema?.input) : schema.input
    const blocked = schema?.blocked

    if (blocked) {
        return null
    }

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
        case "sub-flow":
            return <DataTypeSubFlowInputComponent
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