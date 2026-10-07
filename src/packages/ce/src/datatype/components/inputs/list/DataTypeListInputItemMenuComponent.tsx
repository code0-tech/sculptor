import React from "react";
import {Menu, MenuContent, MenuPortal, MenuTrigger} from "@code0-tech/pictor";
import {
    Flow,
    LiteralValue,
    NodeFunction,
    NodeParameterValue,
    ReferenceValue,
    SubFlowValue
} from "@code0-tech/sagittarius-graphql-types";
import {Schema} from "@code0-tech/triangulum";
import {DataTypeInputComponent} from "@edition/datatype/components/inputs/DataTypeInputComponent";

export interface DataTypeListInputItemMenuComponentProps {
    schema: Schema | undefined
    initialValue?: NodeParameterValue
    flowId?: Flow['id']
    nodeId?: NodeFunction['id']
    parameterIndex?: number
    open: boolean
    onOpenChange: (open: boolean) => void
    onChange: (value: LiteralValue | ReferenceValue | SubFlowValue | NodeFunction | null) => void
    children: React.ReactNode
}

export const DataTypeListInputItemMenuComponent: React.FC<DataTypeListInputItemMenuComponentProps> = (props) => {

    const {schema, initialValue, flowId, nodeId, parameterIndex, open, onOpenChange, onChange, children} = props

    return <Menu open={open} onOpenChange={onOpenChange} modal={false}>
        <MenuTrigger asChild>
            <span style={{cursor: "pointer"}} onMouseDown={event => event.preventDefault()}>
                {children}
            </span>
        </MenuTrigger>
        <MenuPortal>
            <MenuContent color={"primary"} align={"start"} alignOffset={0} sideOffset={4}
                         style={{zIndex: 49}}
                         onKeyDown={event => event.stopPropagation()}
                         onCloseAutoFocus={event => event.preventDefault()}>
                <DataTypeInputComponent schema={{...(schema as Schema)}}
                                        formValidation={{valid: true}}
                                        initialValue={initialValue}
                                        flowId={flowId}
                                        nodeId={nodeId}
                                        parameterIndex={parameterIndex}
                                        onChange={change => onChange(change ?? null)}/>
            </MenuContent>
        </MenuPortal>
    </Menu>
}
