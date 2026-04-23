import {Node, useReactFlow, useStore} from "@xyflow/react";
import {shallow} from "zustand/shallow";
import React, {useState} from "react";

export const useSelectedFunctionNode = () => {
    const localSelectedNode = useStore((s) => s.nodes.filter((node) => node.selected)[0], shallow) as Node | undefined
    return React.useMemo(() => localSelectedNode, [localSelectedNode?.id])
}

export const setSelectedFunctionNode = (nodeId: string, reactFlow: ReturnType<typeof useReactFlow>) => {

    reactFlow.setNodes((nodes) =>
        nodes.map((node) => ({
            ...node,
            selected: node.id === nodeId,
        }))
    )

    reactFlow.fitView({
        nodes: [{id: nodeId}],
        duration: 250,
        maxZoom: reactFlow.getZoom(),
        minZoom: 1,
    });


}