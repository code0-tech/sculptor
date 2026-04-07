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
    nodeId?: NodeFunction['id'] //TODO if undefined we need to get infos from trigger
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

    const flow = React.useMemo(
        () => flowId ? flowService.getById(flowId) : undefined,
        [flowStore, flowId]
    )

    const node = React.useMemo(
        () => nodeId && flowId ? flowService.getNodeById(flowId, nodeId) : undefined,
        [flowStore, flowId, nodeId]
    )

    const functionDefinition = React.useMemo(
        () => node ? functionService.getById(node?.functionDefinition?.id) : undefined,
        [functionStore, node]
    )

    const types = React.useMemo(
        () => nodeId ? getTypesFromFunction(functionDefinition!) : undefined,
        [functionDefinition, nodeId]
    )

    const dataTypeVariant = React.useMemo(
        () => types ? getTypeVariant(types.parameters[parameterIndex], dataTypeService.values())[0].variant : undefined,
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