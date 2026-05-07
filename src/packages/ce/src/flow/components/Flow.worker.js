import {getFlowValidation, getSignatureSchema, getTypeFromValue, getValueFromType} from "@code0-tech/triangulum";
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
    const {id, action, payload} = event.data;
    let result;

    try {
        switch (action) {
            case 'validation':
                result = getFlowValidation(payload.flow, payload.functions, payload.dataTypes)
                    .diagnostics.map(diagnostic =>
                        errorResult(diagnostic.nodeId, diagnostic.parameterIndex, diagnostic.message));
                break;
            case 'value_suggestions':
                result = [];
                break;
            case 'reference_suggestions':
                result = [];
                break;
            case 'node_suggestions':
                result = [];
                break;
            case 'node_type_extraction':
                result = {};
                break;
            case 'type_extraction':
                result = getTypeFromValue(payload.value, payload.dataTypes);
                break;
            case 'value_extraction':
                result = getValueFromType(payload.type, payload.dataTypes);
                break;
            case 'type_variant':
                result = 0;
                break;
            case 'schema':
                result = getSignatureSchema(payload.flow, payload.dataTypes, payload.functions, payload.nodeId);
                break;
        }

        postMessage({id, data: result});
    } catch (error) {
        postMessage({id, error: error.message});
    }
});

