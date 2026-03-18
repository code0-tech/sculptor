import {getFlowValidation} from "@code0-tech/triangulum";
import {DataType, Flow, FunctionDefinition, type NodeFunction} from "@code0-tech/sagittarius-graphql-types";
import {InspectionSeverity, ValidationResult} from "@core/util/inspection";

const errorResult = (
    nodeId: NodeFunction['id'],
    parameterIndex: number,
    message: string
): ValidationResult => ({
    nodeId: nodeId,
    parameterIndex: parameterIndex,
    type: InspectionSeverity.ERROR,
    message: [{
        code: "en-US",
        content: message
    }]
})

addEventListener("message", (event: MessageEvent<{ flow: Flow, functions: FunctionDefinition[], dataTypes: DataType[] }>) => {
    const validation = getFlowValidation(event.data.flow, event.data.functions, event.data.dataTypes)
    const result = validation.diagnostics.map(diagnostic => errorResult(diagnostic.nodeId, diagnostic.parameterIndex!, diagnostic.message))
    postMessage(result);
});