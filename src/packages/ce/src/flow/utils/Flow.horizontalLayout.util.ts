import {Node} from "@xyflow/react";
import {getVerticalLayoutElements} from "@edition/flow/utils/Flow.verticalLayout.util";

export const getHorizontalLayoutElements = (nodes: Node[], dirtyIds?: Set<string>) => {
    if (!dirtyIds || dirtyIds.size === 0) return {nodes}

    const transpose = (node: Node): Node => ({
        ...node,
        position: {x: node.position?.y ?? 0, y: node.position?.x ?? 0},
        measured: node.measured
            ? {...node.measured, width: node.measured.height, height: node.measured.width}
            : node.measured,
        style: node.style
            ? {...node.style, width: node.style.height, height: node.style.width}
            : node.style,
    })

    const transposed = nodes.map(transpose)
    const layouted = getVerticalLayoutElements(transposed, dirtyIds)

    return {
        nodes: layouted.nodes.map((node, index) =>
            node === transposed[index] ? nodes[index] : transpose(node)
        )
    }
}
