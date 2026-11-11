import React from "react";
import {Text} from "@code0-tech/pictor";
import {Flow, LiteralValue, NodeFunction, NodeParameterValue} from "@code0-tech/sagittarius-graphql-types";
import {ListInput, Schema} from "@code0-tech/triangulum";
import {LiteralBadgeComponent} from "@edition/datatype/components/badges/LiteralBadgeComponent";
import {
    DataTypeListInputItemMenuComponent
} from "@edition/datatype/components/inputs/list/DataTypeListInputItemMenuComponent";
import {ListEntry} from "@edition/datatype/components/inputs/list/DataTypeListInput.util";

export interface DataTypeListTextLiteralTagComponentProps {
    token: string
    index: number
    entries: ListEntry[]
    listSchema?: ListInput
    flowId: Flow['id']
    nodeId?: NodeFunction['id']
    parameterIndex?: number
    open: boolean
    onOpenChange: (open: boolean) => void
    onChange: (value: NodeParameterValue | NodeFunction | null, index: number) => void
}

export const DataTypeListTextLiteralTagComponent: React.FC<DataTypeListTextLiteralTagComponentProps> = (props) => {

    const {token, index, entries, listSchema, flowId, nodeId, parameterIndex, open, onOpenChange, onChange} = props

    if (index < 0) return <Text size={"sm"}>{token}</Text>

    const entry = entries[index]
    const target = (listSchema?.items?.length === entries.length
        ? listSchema?.items?.[index]
        : listSchema?.declaredItems?.[0]) as Schema | undefined

    return <DataTypeListInputItemMenuComponent schema={target}
                                               initialValue={{
                                                   __typename: "LiteralValue",
                                                   value: entry
                                               } as LiteralValue}
                                               flowId={flowId}
                                               nodeId={nodeId}
                                               parameterIndex={parameterIndex}
                                               open={open}
                                               onOpenChange={onOpenChange}
                                               onChange={change => onChange(change ?? null, index)}>
        <LiteralBadgeComponent schema={target} value={{__typename: "LiteralValue", value: entry}}/>
    </DataTypeListInputItemMenuComponent>
}
