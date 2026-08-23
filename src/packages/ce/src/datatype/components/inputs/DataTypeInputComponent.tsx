import React from "react";
import {DataTypeTextInputComponent} from "./text/DataTypeTextInputComponent";
import {NodeSchema, Schema} from "@code0-tech/triangulum";
import {
    LiteralValue,
    NodeFunction,
    NodeParameterValue,
    ReferenceValue,
    SubFlowValue
} from "@code0-tech/sagittarius-graphql-types";
import {DataTypeBooleanInputComponent} from "@edition/datatype/components/inputs/boolean/DataTypeBooleanInputComponent";
import {DataTypeSelectInputComponent} from "@edition/datatype/components/inputs/select/DataTypeSelectInputComponent";
import {
    DataTypeListSelectInputComponent
} from "@edition/datatype/components/inputs/list-select/DataTypeListSelectInputComponent";
import {
    DataTypeListBooleanInputComponent
} from "@edition/datatype/components/inputs/list-boolean/DataTypeListBooleanInputComponent";
import {
    DataTypeListTextInputComponent
} from "@edition/datatype/components/inputs/list-text/DataTypeListTextInputComponent";
import {
    DataTypeListNumberInputComponent
} from "@edition/datatype/components/inputs/list-number/DataTypeListNumberInputComponent";
import {InputWrapperProps} from "@code0-tech/pictor/dist/components/form/InputWrapper";
import {DataTypeNumberInputComponent} from "@edition/datatype/components/inputs/number/DataTypeNumberInputComponent";
import {DataTypeDateInputComponent} from "@edition/datatype/components/inputs/date/DataTypeDateInputComponent";
import {DataTypeColorInputComponent} from "@edition/datatype/components/inputs/color/DataTypeColorInputComponent";
import {DataTypeFileInputComponent} from "@edition/datatype/components/inputs/file/DataTypeFileInputComponent";
import {DataTypeJSONInputComponent} from "@edition/datatype/components/inputs/json/DataTypeJSONInputComponent";
import {DataTypeGenericInputComponent} from "@edition/datatype/components/inputs/generic/DataTypeGenericInputComponent";
import {
    DataTypeSubFlowInputComponent
} from "@edition/datatype/components/inputs/sub-flow/DataTypeSubFlowInputComponent";

export interface DataTypeInputComponentProps extends Omit<InputWrapperProps<NodeParameterValue | NodeFunction>, "onChange"> {
    schema: (NodeSchema | Schema)
    clearable?: boolean
    onChange?: (value: ReferenceValue | SubFlowValue | LiteralValue | NodeFunction | null) => void
    suggestions?: (NodeFunction | SubFlowValue | ReferenceValue | LiteralValue)[]
    onClear?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

export const DataTypeInputComponent: React.FC<DataTypeInputComponentProps> = (props) => {

    const {schema, ...rest} = props

    const suggestions = "schema" in (schema ?? {}) ? (schema as NodeSchema)?.schema?.suggestions as (NodeFunction | ReferenceValue | LiteralValue)[] : []
    const inputName = "schema" in (schema ?? {}) ? (schema as NodeSchema)?.schema?.input : (schema as Schema)?.input

    return React.useMemo(
        () => {
            if ("schema" in (schema ?? {}) && (((schema as NodeSchema).blockedBy?.length ?? 0) > 0) && (rest.formValidation?.valid ?? false)) {
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
                case "list-select":
                    return <DataTypeListSelectInputComponent
                        schema={schema}
                        suggestions={suggestions}
                        {...rest}/>
                case "list-boolean":
                    return <DataTypeListBooleanInputComponent
                        schema={schema}
                        suggestions={suggestions}
                        {...rest}/>
                case "list-text":
                    return <DataTypeListTextInputComponent
                        schema={schema}
                        suggestions={suggestions}
                        {...rest}/>
                case "list-number":
                    return <DataTypeListNumberInputComponent
                        schema={schema}
                        suggestions={suggestions}
                        {...rest}/>
                case "number":
                    return <DataTypeNumberInputComponent
                        schema={schema}
                        suggestions={suggestions}
                        {...rest}/>
                case "date":
                    return <DataTypeDateInputComponent
                        schema={schema}
                        suggestions={suggestions}
                        {...rest}/>
                case "color":
                    return <DataTypeColorInputComponent
                        schema={schema}
                        suggestions={suggestions}
                        {...rest}/>
                case "file":
                case "list-file":
                    return <DataTypeFileInputComponent
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
        },
        [rest.initialValue, inputName, suggestions?.length ?? 0, rest.formValidation?.valid ?? true, rest.formValidation?.notValidMessage ?? ""]
    )
}