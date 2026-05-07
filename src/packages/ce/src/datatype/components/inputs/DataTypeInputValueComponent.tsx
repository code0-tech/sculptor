import React from "react";
import {InputWrapper} from "@code0-tech/pictor/dist/components/form/InputWrapper";
import {DataTypeInputComponentProps} from "@edition/datatype/components/inputs/DataTypeInputComponent";
import {DataTypeInputControlsComponent} from "@edition/datatype/components/inputs/DataTypeInputControlsComponent";
import {NodeBadgeComponent} from "@edition/datatype/components/badges/NodeBadgeComponent";
import {ReferenceBadgeComponent} from "@edition/datatype/components/badges/ReferenceBadgeComponent";

export interface DataTypeInputValueComponentProps extends Omit<DataTypeInputComponentProps, 'schema'> {
    children?: React.ReactNode
    inside?: boolean
}

export const DataTypeInputValueComponent: React.FC<DataTypeInputValueComponentProps> = (props) => {

    const {children, inside = false, initialValue, suggestions, onChange, formValidation} = props

    return inside || initialValue?.__typename === "NodeFunction" || initialValue?.__typename === "NodeFunctionIdWrapper" || initialValue?.__typename === "ReferenceValue" ?
        <InputWrapper formValidation={{...formValidation, setValue: undefined}} right={
            <DataTypeInputControlsComponent suggestions={suggestions} onSelect={onChange}/>
        } rightType={"action"}>
            <div style={{alignSelf: "center", flex: "1 1 auto"}}>
                {
                    initialValue?.__typename === "NodeFunction" || initialValue?.__typename === "NodeFunctionIdWrapper" ? (
                        <NodeBadgeComponent value={initialValue}/>
                    ) : initialValue?.__typename === "ReferenceValue" ? (
                        <ReferenceBadgeComponent value={initialValue}/>
                    ) : inside ? children : null
                }
            </div>
        </InputWrapper> : children

}