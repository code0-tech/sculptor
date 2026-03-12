import {Flow, NodeFunction, NodeParameter} from "@code0-tech/sagittarius-graphql-types";
import React from "react";
import {DataTypeTextInputComponent} from "./text/DataTypeTextInputComponent";
import {DataTypeJSONInputComponent} from "./json/DataTypeJSONInputComponent";
import {InputProps, useService, useStore} from "@code0-tech/pictor";
import {FlowService} from "@edition/flow/services/Flow.service";
import {DatatypeService} from "@edition/datatype/services/Datatype.service";
import {FunctionService} from "@edition/function/services/Function.service";

export interface DataTypeInputComponentProps extends Omit<InputProps<any | null>, "wrapperComponent" | "type"> {
    flowId: Flow['id']
    nodeId: NodeFunction['id']
    parameterIndex: number
    clearable?: boolean
    onClear?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

export const DataTypeInputComponent: React.FC<DataTypeInputComponentProps> = (props) => {

    const {flowId, nodeId, parameterIndex, ...rest} = props

    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)
    const dataTypeService = useService(DatatypeService)
    const dataTypeStore = useStore(DatatypeService)
    const functionService = useService(FunctionService)
    const functionStore = useStore(FunctionService)

    const node = React.useMemo(
        () => flowService.getNodeById(flowId, nodeId),
        [flowStore, flowId, nodeId]
    )

    const parameter = React.useMemo(
        () => node?.parameters?.nodes?.[parameterIndex],
        [node, parameterIndex]
    )

    const functionDefinition = React.useMemo(
        () => functionService.getById(node?.functionDefinition?.id!),
        [functionStore, node]
    )

    const parameterDefinition = React.useMemo(
        () => functionDefinition?.parameterDefinitions?.find(pd => pd.id === parameter?.parameterDefinition?.id),
        [functionDefinition, parameter]
    )

    const dataType = React.useMemo(
        () => dataTypeService.getDataType(parameterDefinition?.dataTypeIdentifier!),
        [dataTypeStore, parameterDefinition]
    )

    switch (dataType?.variant) {
        case "ARRAY":
        case "OBJECT":
            return <DataTypeJSONInputComponent
                flowId={flowId}
                nodeId={nodeId}
                parameterIndex={parameterIndex}
                {...rest}
            />
        default:
            return <DataTypeTextInputComponent
                flowId={flowId}
                nodeId={nodeId}
                parameterIndex={parameterIndex}
                {...rest}
            />
    }
}