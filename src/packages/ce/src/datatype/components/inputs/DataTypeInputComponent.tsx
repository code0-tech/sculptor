import React from "react";
import {DataTypeTextInputComponent} from "./text/DataTypeTextInputComponent";
import {DataTypeJSONInputComponent} from "@edition/datatype/components/inputs/json/DataTypeJSONInputComponent";
import {NodeSchema} from "@code0-tech/triangulum";
import {LiteralValue, NodeFunction, NodeParameterValue, ReferenceValue} from "@code0-tech/sagittarius-graphql-types";
import {
    FunctionSuggestion,
    FunctionSuggestionType
} from "@edition/function/components/suggestion/FunctionSuggestionComponent.view";
import {toInputSuggestions} from "@edition/function/components/suggestion/FunctionSuggestionMenuComponent.util";
import {FALLBACK_FUNCTION_NAME} from "@core/util/fallback-translations";
import {DataTypeBooleanInputComponent} from "@edition/datatype/components/inputs/boolean/DataTypeBooleanInputComponent";
import {DataTypeSelectInputComponent} from "@edition/datatype/components/inputs/select/DataTypeSelectInputComponent";
import {InputWrapperProps} from "@code0-tech/pictor/dist/components/form/InputWrapper";

export interface DataTypeInputComponentProps extends Omit<InputWrapperProps<NodeParameterValue | NodeFunction>, "wrapperComponent"> {
    schema: NodeSchema
    clearable?: boolean
    suggestions?: (NodeFunction | ReferenceValue | LiteralValue)[]
    onClear?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

export const DataTypeInputComponent: React.FC<DataTypeInputComponentProps> = (props) => {

    const {schema, ...rest} = props

    const suggestions = schema?.schema?.suggestions as (NodeFunction | ReferenceValue | LiteralValue)[]

    switch (schema?.schema?.input) {
        case "data":
        case "list":
            return <DataTypeJSONInputComponent
                schema={schema}
                suggestions={suggestions}
                {...rest}
            />
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
        default:
            return <DataTypeTextInputComponent
                suggestions={suggestions}
                schema={schema}
                {...rest}
            />
    }
}