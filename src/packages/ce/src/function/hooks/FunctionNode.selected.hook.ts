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
    const node = reactFlow.getNode(nodeId)
    const placement = node?.measured?.width && node?.measured?.height
        ? `${node.position.x}:${node.position.y}:${node.measured.width}:${node.measured.height}`
        : undefined

    if (!placement || placement !== previousPlacement) {
        if (attempt < 60) requestAnimationFrame(() => centerFunctionNode(nodeId, reactFlow, placement, attempt + 1))
        return
    }

    reactFlow.setCenter(
        node!.position.x + node!.measured!.width! / 2,
        node!.position.y + node!.measured!.height! / 2,
        {zoom: reactFlow.getZoom(), duration: 250}
    )
}

export const setSelectedFunctionNode = (nodeId: string, reactFlow: ReturnType<typeof useReactFlow>) => {
    selectFunctionNode(nodeId, reactFlow)
    centerFunctionNode(nodeId, reactFlow)
}
