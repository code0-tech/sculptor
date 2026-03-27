import {Flow, NodeFunction} from "@code0-tech/sagittarius-graphql-types";
import React from "react";
import {DataTypeTextInputComponent} from "./text/DataTypeTextInputComponent";
import {InputProps, useService, useStore} from "@code0-tech/pictor";
import {FlowService} from "@edition/flow/services/Flow.service";
import {DatatypeService} from "@edition/datatype/services/Datatype.service";
import {FunctionService} from "@edition/function/services/Function.service";
import {DataTypeVariant, getTypesFromFunction, getTypeVariant} from "@code0-tech/triangulum";
import {DataTypeJSONInputComponent} from "@edition/datatype/components/inputs/json/DataTypeJSONInputComponent";

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
    const dataTypeStore = useStore(DatatypeService)
    const dataTypeService = useService(DatatypeService)
    const functionStore = useStore(FunctionService)
    const functionService = useService(FunctionService)

    const node = React.useMemo(
        () => flowService.getNodeById(flowId, nodeId),
        [flowStore, flowId, nodeId]
    )

    const functionDefinition = React.useMemo(
        () => functionService.getById(node?.functionDefinition?.id),
        [functionStore, node]
    )

    const types = React.useMemo(
        () => getTypesFromFunction(functionDefinition!),
        [functionDefinition]
    )

    const dataTypeVariant = React.useMemo(
        () => getTypeVariant(types.parameters[parameterIndex], dataTypeService.values()),
        [dataTypeStore, types]
    )

    switch (dataTypeVariant) {
        case DataTypeVariant.ARRAY:
        case DataTypeVariant.OBJECT:
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