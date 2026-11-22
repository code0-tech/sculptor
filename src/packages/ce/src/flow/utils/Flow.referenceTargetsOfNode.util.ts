import {Flow, NodeFunction} from "@code0-tech/sagittarius-graphql-types";
import {referenceTargetIdsOfValue} from "@edition/flow/utils/Flow.referenceTargetsOfValue.util";

export const referenceTargetIdsOfNode = (node: NodeFunction | null | undefined, flowId: Flow["id"]): string[] =>
    (node?.parameters?.nodes ?? []).flatMap(parameter => referenceTargetIdsOfValue(parameter?.value, flowId))
