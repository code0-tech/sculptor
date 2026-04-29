import {Flow, NodeFunction} from "@code0-tech/sagittarius-graphql-types";
import {Component} from "@code0-tech/pictor";
import {NodeSchema} from "@code0-tech/triangulum";

export interface FunctionNodeComponentProps extends Record<string, unknown>, Component<HTMLDivElement> {
    nodeId?: NodeFunction['id']
    flowId: Flow['id']
    schema: NodeSchema
    color: string
    parentNodeId?: NodeFunction['id']
    isParameter?: boolean
    index?: number
}