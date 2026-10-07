import React from "react";
import {ReferenceValue} from "@code0-tech/sagittarius-graphql-types";
import {
    Flex,
    MenuItem,
    MenuSub,
    MenuSubContent,
    MenuSubTrigger,
    TagInputMenuItem,
    TagInputSubMenu,
    Text
} from "@code0-tech/pictor";
import {IconChevronRight} from "@tabler/icons-react";
import {SuggestionPathNode, SuggestionTagKey} from "@edition/function/components/suggestion/Suggestion.util";

export interface DataTypeInputMenuReferencePathComponentProps {
    nodes: Map<string, SuggestionPathNode>
    mode?: "tag" | "menu"
    tagKeys?: SuggestionTagKey[]
    onSelect?: (value: ReferenceValue) => void
}

export const DataTypeInputMenuReferencePathComponent: React.FC<DataTypeInputMenuReferencePathComponentProps> = (props) => {

    const {nodes, mode = "tag", tagKeys, onSelect} = props

    return <>
        {Array.from(nodes.values()).map(node => {

            const tagKey = node.index === undefined ? undefined : tagKeys?.[node.index]

            const self = mode === "menu"
                ? (node.value
                    ? <MenuItem onSelect={() => onSelect?.(node.value!)}>{node.label}</MenuItem>
                    : null)
                : (tagKey === undefined
                    ? null
                    : <TagInputMenuItem value={tagKey} data={node.value} aliases={[node.label]}>
                        {node.label}
                    </TagInputMenuItem>)

            if (node.children.size <= 0) return <React.Fragment key={node.label}>{self}</React.Fragment>

            const label = <Flex align={"center"} justify={"space-between"} style={{gap: "0.7rem"}} w={"100%"}>
                <Text>{node.label}</Text>
                <IconChevronRight size={12}/>
            </Flex>

            if (mode === "menu") return <MenuSub key={node.label}>
                <MenuSubTrigger>{label}</MenuSubTrigger>
                <MenuSubContent align={"start"} collisionPadding={16} alignOffset={0} sideOffset={0}>
                    {self}
                    <DataTypeInputMenuReferencePathComponent nodes={node.children} mode={mode} onSelect={onSelect}/>
                </MenuSubContent>
            </MenuSub>

            return <TagInputSubMenu key={node.label} label={label}>
                {self}
                <DataTypeInputMenuReferencePathComponent nodes={node.children} mode={mode} tagKeys={tagKeys}/>
            </TagInputSubMenu>
        })}
    </>
}
