import {getReferenceSuggestions} from "@code0-tech/triangulum";
import {DataType, Flow, FunctionDefinition, NodeFunction} from "@code0-tech/sagittarius-graphql-types";

addEventListener("message", (event: MessageEvent<{
    flow: Flow,
    nodeId?: NodeFunction['id'],
    parameterIndex?: number,
    functions: FunctionDefinition[],
    dataTypes: DataType[]
}>) => {
    const suggestions = getReferenceSuggestions(event.data.flow, event.data.nodeId, event.data.parameterIndex, event.data.functions, event.data.dataTypes)
    postMessage(suggestions);
});

