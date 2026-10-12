import {FlowType} from "@code0-tech/sagittarius-graphql-types";
import {FlowTemplate} from "@core/util/flow-template";

/**
 * The one flow the onboarding creates: a webhook that answers every call with a fixed
 * json message. It is defined here instead of coming from `/api/flow-templates`,
 * because that endpoint serves the playground mock and is empty in a real deployment,
 * while the guided first run has to end in a flow that can be executed right away.
 *
 * The signature is taken from the resolved flow type rather than hard coded, so the
 * template keeps working when the runtime ships a new version of the webhook trigger.
 */
export const getOnboardingFlowTemplate = (flowTypes: FlowType[]): FlowTemplate => ({
    slug: "onboarding-hello-world",
    name: "Hello World",
    description: "A webhook that answers every call with a fixed json message. The shortest way to see a flow run end to end.",
    flowTypeIdentifier: "REST",
    signature: flowTypes.find(flowType => flowType.identifier === "REST")?.signature ?? "",
    startingNodeId: 1,
    settings: [
        {identifier: "http_schema", cast: null, value: "application/json"},
        {identifier: "http_url", cast: null, value: "/hello-world"},
        {identifier: "http_method", cast: null, value: "POST"},
        {identifier: "http_auth", cast: null, value: null},
        {identifier: "http_auth_value", cast: null, value: null},
        {identifier: "input_schema", cast: "{}", value: {type: "object", additionalProperties: false}}
    ],
    nodes: [
        {
            id: 1,
            nextId: null,
            functionIdentifier: "rest::control::respond",
            parameters: [
                {identifier: "http_status_code", cast: null, value: {kind: "literal", value: 200, references: []}},
                {
                    identifier: "http_schema",
                    cast: null,
                    value: {kind: "literal", value: "application/json", references: []}
                },
                {
                    identifier: "payload",
                    cast: null,
                    value: {kind: "literal", value: {message: "Hello, world!"}, references: []}
                }
            ]
        }
    ]
})
