import {getTypesFromNode} from "@code0-tech/triangulum";
import {DataType, FunctionDefinition, NodeFunction} from "@code0-tech/sagittarius-graphql-types";

addEventListener("message", (event: MessageEvent<{
    node: NodeFunction,
    functions: FunctionDefinition[],
    dataTypes: DataType[]
}>) => {
    const types = getTypesFromNode(event.data.node, event.data.functions, event.data.dataTypes)
    postMessage(types);
});

