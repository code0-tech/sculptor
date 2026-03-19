import {getNodeSuggestions} from "@code0-tech/triangulum";
import {DataType, FunctionDefinition} from "@code0-tech/sagittarius-graphql-types";

addEventListener("message", (event: MessageEvent<{ type?: string, functions: FunctionDefinition[], dataTypes: DataType[] }>) => {
    const suggestions = getNodeSuggestions(event.data.type, event.data.functions, event.data.dataTypes)
    postMessage(suggestions);
});

