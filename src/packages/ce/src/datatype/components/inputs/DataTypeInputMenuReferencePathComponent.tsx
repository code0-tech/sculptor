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
import {useFlowReferenceHoverStore} from "@edition/flow/hooks/Flow.reference.hover.hook";

export interface DataTypeInputMenuReferencePathComponentProps {
    nodes: Map<string, SuggestionPathNode>
    targetNodeId?: string
    mode?: "tag" | "menu"
    tagKeys?: SuggestionTagKey[]
    onSelect?: (value: ReferenceValue) => void
}

export const DataTypeInputMenuReferencePathComponent: React.FC<DataTypeInputMenuReferencePathComponentProps> = (props) => {

    const {nodes, targetNodeId, mode = "tag", tagKeys, onSelect} = props

    const setHoveredNodeId = useFlowReferenceHoverStore(state => state.setHoveredNodeId)

    return <>
        {Array.from(nodes.values()).map(node => {

            const tagKey = node.index === undefined ? undefined : tagKeys?.[node.index]

            const content = <Flex align={"center"} w={"100%"}
                                  onMouseEnter={() => setHoveredNodeId(targetNodeId ?? null)}
                                  onMouseLeave={() => setHoveredNodeId(null)}>
                <Text>{node.label}</Text>
            </Flex>

            const self = mode === "menu"
                ? (node.value
                    ? <MenuItem onMouseEnter={() => setHoveredNodeId(targetNodeId ?? null)}
                                onMouseLeave={() => setHoveredNodeId(null)}
                                onFocus={() => setHoveredNodeId(targetNodeId ?? null)}
                                onSelect={() => onSelect?.(node.value!)}>{content}</MenuItem>
                    : null)
                : (tagKey === undefined
                    ? null
                    : <TagInputMenuItem value={tagKey} data={node.value} aliases={[node.label]}
                                        onMouseEnter={() => setHoveredNodeId(targetNodeId ?? null)}
                                        onMouseLeave={() => setHoveredNodeId(null)}>
                        {content}
                    </TagInputMenuItem>)

            if (node.children.size <= 0) return <React.Fragment key={node.label}>{self}</React.Fragment>

            const label = <Flex align={"center"} justify={"space-between"} style={{gap: "0.7rem"}} w={"100%"}
                                onMouseEnter={() => setHoveredNodeId(targetNodeId ?? null)}
                                onMouseLeave={() => setHoveredNodeId(null)}>
                <Text>{node.label}</Text>
                <IconChevronRight size={12}/>
            </Flex>

            if (mode === "menu") return <MenuSub key={node.label}>
                <MenuSubTrigger onMouseEnter={() => setHoveredNodeId(targetNodeId ?? null)}
                                onMouseLeave={() => setHoveredNodeId(null)}
                                onFocus={() => setHoveredNodeId(targetNodeId ?? null)}>{label}</MenuSubTrigger>
                <MenuSubContent align={"start"} collisionPadding={16} alignOffset={0} sideOffset={0}
                                onMouseEnter={() => setHoveredNodeId(targetNodeId ?? null)}
                                onMouseLeave={() => setHoveredNodeId(null)}>
                    {self}
                    <DataTypeInputMenuReferencePathComponent nodes={node.children} targetNodeId={targetNodeId}
                                                             mode={mode} onSelect={onSelect}/>
                </MenuSubContent>
            </MenuSub>

            return <TagInputSubMenu key={node.label} label={label}>
                {self}
                <DataTypeInputMenuReferencePathComponent nodes={node.children} targetNodeId={targetNodeId} mode={mode}
                                                         tagKeys={tagKeys}/>
            </TagInputSubMenu>
        })}
    </>
}
