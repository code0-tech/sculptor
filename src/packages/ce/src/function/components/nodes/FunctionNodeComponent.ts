import {Flow, FunctionDefinition, NodeFunction} from "@code0-tech/sagittarius-graphql-types";
import {Component} from "@code0-tech/pictor";
import {NodeSchema} from "@code0-tech/triangulum";

export interface FunctionNodeComponentProps extends Record<string, unknown>, Component<HTMLDivElement> {
    nodeId?: NodeFunction['id']
    functionId?: FunctionDefinition['id']
    flowId: Flow['id']
    schema: NodeSchema[]
    compareType?: 'added' | 'removed' | 'changed'
    color: string
    parentNodeId?: NodeFunction['id']
    isParameter?: boolean
    index?: number
}