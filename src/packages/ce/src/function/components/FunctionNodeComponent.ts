import {Flow, NodeFunction} from "@code0-tech/sagittarius-graphql-types";
import {Code0Component} from "@code0-tech/pictor";

export interface FunctionNodeProps extends Record<string, unknown>, Code0Component<HTMLDivElement> {
    nodeId: NodeFunction['id']
    flowId: Flow['id']
    color: string
    parentNodeId?: NodeFunction['id']
    isParameter?: boolean
    index?: number
}