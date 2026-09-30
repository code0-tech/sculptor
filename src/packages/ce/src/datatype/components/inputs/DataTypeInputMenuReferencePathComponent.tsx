import React from "react";
import {ReferenceValue} from "@code0-tech/sagittarius-graphql-types";
import {Flex, TagInputMenuItem, TagInputSubMenu, Text} from "@code0-tech/pictor";
import {IconChevronRight} from "@tabler/icons-react";

export interface DataTypeInputMenuReferencePathNode {
    label: string
    value?: ReferenceValue
    tagKey?: unknown
    children: Map<string, DataTypeInputMenuReferencePathNode>
}

export interface DataTypeInputMenuReferencePathComponentProps {
    nodes: Map<string, DataTypeInputMenuReferencePathNode>
}

export const DataTypeInputMenuReferencePathComponent: React.FC<DataTypeInputMenuReferencePathComponentProps> = ({nodes}) => {
    return <>
        {Array.from(nodes.values()).map(node => {
            if (node.children.size <= 0) {
                if (node.tagKey === undefined) return null
                return <TagInputMenuItem key={node.label} value={node.tagKey} data={node.value}
                                         aliases={[node.label]}>
                    {node.label}
                </TagInputMenuItem>
            }

            return <TagInputSubMenu key={node.label} label={
                <Flex align={"center"} justify={"space-between"} style={{gap: "0.7rem"}} w={"100%"}>
                    <Text>{node.label}</Text>
                    <IconChevronRight size={12}/>
                </Flex>
            }>
                {node.tagKey !== undefined ? (
                    <TagInputMenuItem value={node.tagKey} data={node.value} aliases={[node.label]}>
                        {node.label}
                    </TagInputMenuItem>
                ) : null}
                <DataTypeInputMenuReferencePathComponent nodes={node.children}/>
            </TagInputSubMenu>
        })}
    </>
}
