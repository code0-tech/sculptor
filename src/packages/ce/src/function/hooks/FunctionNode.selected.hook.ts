import {Node, useReactFlow, useStore} from "@xyflow/react";
import {shallow} from "zustand/shallow";
import React from "react";

export const useSelectedFunctionNode = () => {
    const localSelectedNode = useStore((s) => s.nodes.filter((node) => node.selected)[0], shallow) as Node | undefined
    return React.useMemo(() => localSelectedNode, [localSelectedNode?.id])
}

const selectFunctionNode = (nodeId: string, reactFlow: ReturnType<typeof useReactFlow>) => {
    reactFlow.setNodes((nodes) =>
        nodes.map((node) => ({
            ...node,
            selected: node.id === nodeId,
        }))
    )
}

export const centerFunctionNode = (
    nodeId: string,
    reactFlow: ReturnType<typeof useReactFlow>,
    previousPlacement?: string,
    attempt: number = 0
) => {
    // a node inside a group carries a position relative to that group, so only the absolute one centres
    const node = reactFlow.getInternalNode(nodeId)
    const position = node?.internals?.positionAbsolute ?? node?.position
    const placement = node?.measured?.width && node?.measured?.height && position
        ? `${position.x}:${position.y}:${node.measured.width}:${node.measured.height}`
        : undefined

    if (!placement || placement !== previousPlacement) {
        if (attempt < 60) requestAnimationFrame(() => centerFunctionNode(nodeId, reactFlow, placement, attempt + 1))
        return
    }

    reactFlow.setCenter(
        position!.x + node!.measured!.width! / 2,
        position!.y + node!.measured!.height! / 2,
        {zoom: reactFlow.getZoom(), duration: 250}
    )
}

export const setSelectedFunctionNode = (nodeId: string, reactFlow: ReturnType<typeof useReactFlow>) => {
    selectFunctionNode(nodeId, reactFlow)
    centerFunctionNode(nodeId, reactFlow)
}
