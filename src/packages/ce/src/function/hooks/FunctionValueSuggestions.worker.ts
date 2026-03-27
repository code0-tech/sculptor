import {getValueSuggestions} from "@code0-tech/triangulum";
import {DataType} from "@code0-tech/sagittarius-graphql-types";

addEventListener("message", (event: MessageEvent<{ type?: string, dataTypes: DataType[] }>) => {
    const suggestions = getValueSuggestions(event.data.type, event.data.dataTypes)
    postMessage(suggestions);
});

