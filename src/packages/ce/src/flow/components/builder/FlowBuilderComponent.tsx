import {
    Background,
    BackgroundVariant,
    Edge,
    Node,
    ReactFlow,
    useEdgesState,
    useNodesState,
    useReactFlow,
    useUpdateNodeInternals
} from "@xyflow/react";
import React from "react";
import "./FlowBuilderComponent.style.scss"
import {FlowBuilderEdgeComponent} from "./FlowBuilderEdgeComponent";
import {Flow, type Namespace, type NamespaceProject} from "@code0-tech/sagittarius-graphql-types";
import {useFlowNodes} from "@edition/flow/hooks/Flow.nodes.hook";
import {ComponentProps, mergeComponentProps} from "@code0-tech/pictor";
import {FunctionNodeDefaultComponent} from "@edition/function/components/nodes/FunctionNodeDefaultComponent";
import {FunctionNodeControlComponent} from "@edition/function/components/nodes/FunctionNodeControlComponent";
import {FunctionNodeEndComponent} from "@edition/function/components/nodes/FunctionNodeEndComponent";
import {FunctionNodeRoundComponent} from "@edition/function/components/nodes/FunctionNodeRoundComponent";
import {FunctionNodeGroupComponent} from "@edition/function/components/nodes/FunctionNodeGroupComponent";
import {FunctionNodeTriggerComponent} from "@edition/function/components/nodes/FunctionNodeTriggerComponent";
import {useEdges} from "@edition/flow/hooks/Flow.edges.hook";
import {FlowPanelSizeComponent} from "@edition/flow/components/panels/FlowPanelSizeComponent";
import {FlowPanelLayoutComponent} from "@edition/flow/components/panels/FlowPanelLayoutComponent";
import {FlowPanelControlComponent} from "@edition/flow/components/panels/FlowPanelControlComponent";
import {FlowPanelDirectionComponent} from "@edition/flow/components/panels/FlowPanelDirectionComponent";
import {FlowBuilderLoadingComponent} from "@edition/flow/components/builder/FlowBuilderLoadingComponent";
import {useFlowLayoutStore} from "@edition/flow/hooks/Flow.layout.hook";
import {getVerticalLayoutElements} from "@edition/flow/utils/Flow.verticalLayout.util";
import {getHorizontalLayoutElements} from "@edition/flow/utils/Flow.horizontalLayout.util";

export interface FlowBuilderProps extends ComponentProps {
    flowId: Flow['id']
    namespaceId: Namespace['id']
    projectId: NamespaceProject['id']
}

export const FlowBuilderComponent: React.FC<FlowBuilderProps> = (props) => {
    const {flowId, namespaceId, projectId, ...rest} = props

    const {getZoom, fitView} = useReactFlow();
    const direction = useFlowLayoutStore(state => state.direction)
    const updateNodeInternals = useUpdateNodeInternals()

    const initialNodes = useFlowNodes(flowId, namespaceId, projectId)
    const initialEdges = useEdges(flowId, namespaceId, projectId)

    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
    const [edges, setEdges, edgeChangeEvent] = useEdgesState<Edge>([])
    const [showTree, setShowTree] = React.useState<boolean>(false)
    const didFitViewRef = React.useRef(false)

    const nodeTypes = React.useMemo(() => ({
        default: FunctionNodeDefaultComponent,
        control: FunctionNodeControlComponent,
        end: FunctionNodeEndComponent,
        round: FunctionNodeRoundComponent,
        group: FunctionNodeGroupComponent,
        trigger: FunctionNodeTriggerComponent,
    }), [])

    const edgeTypes = React.useMemo(() => ({
        default: FlowBuilderEdgeComponent,
    }), [])

    const getLayoutElements = React.useMemo(
        () => direction === "horizontal" ? getHorizontalLayoutElements : getVerticalLayoutElements,
        [direction]
    )

    const afterNextPaint = React.useCallback((action: () => void) => {
        requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(action, 0)))
    }, [])

    const revalidateHandles = React.useCallback((ids: string[]) => {
        requestAnimationFrame(() => {
            ids.forEach(id => updateNodeInternals(id))
        })
    }, [updateNodeInternals])

    const nodeChangeEvent = React.useCallback((changes: any) => {

        onNodesChange(changes)

        const changedIds: string[] = Array.from(new Set(
            changes
                .filter((c: any) => c.type === 'dimensions' || c.type === 'position')
                .map((c: any) => c.id)
        ))

        const dimensionMap = new Map<string, { width?: number; height?: number }>()
        changes
            .filter((c: any) => c.type === 'dimensions')
            .forEach((c: any) => dimensionMap.set(c.id, c.dimensions))

        setNodes(prevNodes => {
            const localNodes = prevNodes.map(node => {
                if (!dimensionMap.has(node.id)) return node;
                const dims = dimensionMap.get(node.id) || {}
                return {
                    ...node,
                    measured: {
                        width: dims.width ?? node.measured?.width ?? 0,
                        height: dims.height ?? node.measured?.height ?? 0,
                    }
                } as Node;
            })

            const layouted = getLayoutElements(localNodes, new Set(changedIds))
            return layouted.nodes as Node[];
        })


        revalidateHandles(changedIds)
    }, [revalidateHandles, getLayoutElements])

    const nodeClickEvent = React.useCallback((_: unknown, clickedNode: Node) => {
        fitView({
            nodes: [{id: clickedNode.id}],
            duration: 250,
            maxZoom: getZoom(),
            minZoom: 1,
        });
    }, [fitView, getZoom])

    React.useEffect(() => {
        const localNodes = initialNodes.map(value => {
            const nodeEls = !value.measured ? document.querySelectorAll("[data-id='" + value.id + "']") : [];
            return {
                ...nodes.find(node => node.id === value.id),
                ...value,
                measured: {
                    width: value.measured?.width ?? (nodeEls[0] as any)?.clientWidth ?? 0,
                    height: value.measured?.height ?? (nodeEls[0] as any)?.clientHeight ?? 0,
                }
            } as unknown as Node
        })

        const layouted = getLayoutElements(localNodes, new Set(localNodes.map(n => n.id)))
        setNodes(layouted.nodes as Node[])
        setEdges(initialEdges as Edge[])

        revalidateHandles((layouted.nodes as Node[]).map(n => n.id))

    }, [initialNodes, initialEdges.length, revalidateHandles, getLayoutElements])

    React.useEffect(() => {
        if (didFitViewRef.current) return
        if (nodes.length <= 0) return

        didFitViewRef.current = true

        afterNextPaint(async () => {
            await fitView({
                padding: "64px",
                maxZoom: 1
            })
            setShowTree(true)
        })
    }, [nodes, didFitViewRef, afterNextPaint])

    React.useEffect(() => {
        if (!didFitViewRef.current) return

        afterNextPaint(() => {
            fitView({
                padding: "64px",
                maxZoom: 1,
                duration: 0
            })
        })
    }, [direction, fitView, afterNextPaint])

    return (
        <ReactFlow
            panOnScroll={false}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={nodeChangeEvent}
            onEdgesChange={edgeChangeEvent}
            {...mergeComponentProps("flow", rest)}
            data-qa-selector={"flow-builder-canvas"}
            data-tree-visibility={showTree}
            proOptions={{hideAttribution: true}}
            onNodeClick={nodeClickEvent}
            nodes={nodes}
            edges={edges}
            panOnDrag={showTree}
            deleteKeyCode={null}
            selectionKeyCode={null}
            zoomOnScroll={showTree}
            zoomOnPinch={showTree}
            zoomOnDoubleClick={showTree}
        >

            {!showTree ? <FlowBuilderLoadingComponent/> : null}
            {showTree ? (
                <>
                    <Background variant={BackgroundVariant.Dots} color="rgba(255,255,255, .05)" gap={8} size={2}/>
                    <FlowPanelSizeComponent/>
                    <FlowPanelLayoutComponent/>
                    <FlowPanelDirectionComponent/>
                    <FlowPanelControlComponent namespaceId={namespaceId} projectId={projectId} flowId={flowId}/>
                </>
            ) : null}
        </ReactFlow>
    )
}
