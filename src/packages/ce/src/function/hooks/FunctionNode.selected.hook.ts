import {Node, useReactFlow, useStore} from "@xyflow/react";
import {shallow} from "zustand/shallow";

export const useSelectedFunctionNode = () => {
    return useStore((s) => s.nodes.filter((node) => node.selected)[0], shallow) as Node | undefined
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