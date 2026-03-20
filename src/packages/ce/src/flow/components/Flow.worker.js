import {
    getFlowValidation,
    getNodeSuggestions,
    getReferenceSuggestions,
    getTypesFromNode,
    getValueSuggestions
} from "@code0-tech/triangulum";
import {InspectionSeverity} from "../../../../core/src/util/inspection";

const errorResult = (
    nodeId,
    parameterIndex,
    message
) => ({
    nodeId: nodeId,
    parameterIndex: parameterIndex,
    type: InspectionSeverity.ERROR,
    message: [{
        code: "en-US",
        content: message
    }]
})

addEventListener("message", (event) => {
    const { id, action, payload } = event.data; // id extrahieren
    let result;

    try {
        switch (action) {
            case 'validation':
                result = getFlowValidation(payload.flow, payload.functions, payload.dataTypes)
                    .diagnostics.map(diagnostic =>
                        errorResult(diagnostic.nodeId, diagnostic.parameterIndex, diagnostic.message));
                break;
            case 'value_suggestions':
                result = getValueSuggestions(payload.type, payload.dataTypes);
                break;
            case 'reference_suggestions':
                result = getReferenceSuggestions(payload.flow, payload.nodeId, payload.parameterIndex, payload.functions, payload.dataTypes);
                break;
            case 'node_suggestions':
                result = getNodeSuggestions(payload.type, payload.functions, payload.dataTypes);
                break;
            case 'type_extraction':
                result = getTypesFromNode(payload.node, payload.functions, payload.dataTypes);
                break;
        }
        // Wichtig: id mitsenden!
        postMessage({ id, data: result });
    } catch (error) {
        postMessage({ id, error: error.message });
    }
});

