import {Flow, NodeFunction} from "@code0-tech/sagittarius-graphql-types";
import {Component} from "@code0-tech/pictor";

export interface FunctionNodeComponentProps extends Record<string, unknown>, Component<HTMLDivElement> {
    nodeId: NodeFunction['id']
    flowId: Flow['id']
    color: string
    parentNodeId?: NodeFunction['id']
    isParameter?: boolean
    index?: number
}