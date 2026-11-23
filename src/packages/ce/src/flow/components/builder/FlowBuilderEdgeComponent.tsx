import {
    BaseEdge,
    Edge,
    EdgeLabelRenderer,
    EdgeProps,
    getBezierPath,
    getSmoothStepPath,
    Position,
    ReactFlowState,
    useStore
} from "@xyflow/react";
import React, {memo} from "react";
import {Flow, NodeFunction} from "@code0-tech/sagittarius-graphql-types";
import {SignatureSchema} from "@code0-tech/triangulum";
import {
    FunctionNodeParameterPortComponent
} from "@edition/function/components/nodes/FunctionNodeParameterPortComponent";
import {Badge, Component} from "@code0-tech/pictor";
import {edgeAddSegments} from "@edition/flow/utils/Flow.edgeAddSegments.util";
import {useFlowLayoutHorizontal} from "@edition/flow/hooks/Flow.layout.hook";

export interface FlowBuilderEdgeDataProps extends Component<HTMLDivElement> {
    color?: string
    type: 'parameter' | 'suggestion' | 'group' | 'default'
    parentNodeId?: NodeFunction['id'] | null
    flowId: Flow['id']
    nodeId?: NodeFunction['id']
    parameterIndex?: number
    parameterSchema?: SignatureSchema["parameters"]
    parameterName?: string
    addable?: boolean
    empty?: boolean
    required?: boolean
}

// @ts-ignore
export type FlowBuilderEdgeProps = EdgeProps<Edge<FlowBuilderEdgeDataProps>>

export const FlowBuilderEdgeComponent: React.FC<FlowBuilderEdgeProps> = memo((props) => {
    const {
        sourceX,
        sourceY,
        targetX,
        targetY,
        id,
        data,
        label,
        style,
        ...rest
    } = props

    const isHorizontal = useFlowLayoutHorizontal()
    const isParameter = data?.type === "parameter"

    const sourcePosition = React.useMemo(() => {
        if (isParameter) return isHorizontal ? Position.Top : Position.Left
        return isHorizontal ? Position.Right : Position.Bottom
    }, [isParameter, isHorizontal])

    const targetPosition = React.useMemo(() => {
        if (isParameter) return isHorizontal ? Position.Bottom : Position.Right
        return isHorizontal ? Position.Left : Position.Top
    }, [isParameter, isHorizontal])

    const [edgePath, labelX, labelY] = isParameter
        ? getBezierPath({
            sourceX,
            sourceY,
            sourcePosition,
            targetX,
            targetY,
            targetPosition,
            curvature: 0.6,
        })
        : getSmoothStepPath({
            sourceX,
            sourceY,
            sourcePosition,
            targetX,
            targetY,
            targetPosition,
            borderRadius: 16,
            stepPosition: 0.5,
        })
    const labelPosition = isParameter
        ? {
            x: sourcePosition === Position.Left ? sourceX - 20 : sourceX,
            y: sourcePosition === Position.Left ? sourceY : sourceY - 20
        }
        : {x: labelX, y: labelY}

    const laneCenter = useStore(React.useCallback((store: ReactFlowState) => {
        if (!data?.addable) return undefined

        const lane = store.edges.filter(edge => {
            const edgeData = edge.data as FlowBuilderEdgeDataProps | undefined

            return edgeData?.type === 'parameter'
                && edge.target === data.nodeId
                && edgeData?.parameterIndex === data.parameterIndex
        })

        if (lane.length % 2 === 1) return undefined

        const positions = lane.flatMap(edge => {
            const node = store.nodeLookup.get(edge.source)
            const position = node?.internals?.positionAbsolute ?? node?.position
            if (!position) return []

            return [isHorizontal
                ? position.x + (node?.measured?.width ?? 0) / 2
                : position.y + (node?.measured?.height ?? 0) / 2]
        })

        if (positions.length === 0) return undefined

        return positions.reduce((sum, position) => sum + position, 0) / positions.length
    }, [data?.addable, data?.nodeId, data?.parameterIndex, isHorizontal]))

    const [centeredPath] = laneCenter === undefined ? [undefined] : getBezierPath({
        sourceX: isHorizontal ? laneCenter : sourceX,
        sourceY: isHorizontal ? sourceY : laneCenter,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        curvature: 0.6,
    })

    const add = React.useMemo(
        () => data?.addable ? edgeAddSegments(centeredPath ?? edgePath) : undefined,
        [edgePath, centeredPath, data?.addable]
    )

    const color = data?.color ?? "#ffffff"
    const gradientId = `dflow-edge-gradient-${id}`
    const addGradientId = `dflow-edge-add-gradient-${id}`

    return (
        <>
            <defs>
                <linearGradient
                    id={gradientId}
                    x1={sourceX}
                    y1={sourceY}
                    x2={targetX}
                    y2={targetY}
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0" stopColor={color} stopOpacity={0.5}/>
                    <stop offset="1" stopColor={color} stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient
                    id={addGradientId}
                    x1={add ? add.button[0] : labelPosition.x}
                    y1={add ? add.button[1] : labelPosition.y}
                    x2={targetX}
                    y2={targetY}
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0" stopColor={"#ffffff"} stopOpacity={0.5}/>
                    <stop offset="1" stopColor={"#ffffff"} stopOpacity={0.05}/>
                </linearGradient>
            </defs>

            <BaseEdge
                id={id}
                path={data?.empty ? "" : add && !centeredPath ? add.parameter : edgePath}
                {...rest}
                style={{
                    stroke: `url(#${gradientId})`,
                    strokeWidth: data?.type === "default" ? "3px" : "2px",
                    strokeLinecap: "round"
                }}
            />

            {add ? (
                <path
                    d={add.path}
                    fill={"none"}
                    stroke={`url(#${addGradientId})`}
                    strokeWidth={"3px"}
                    strokeLinecap={"round"}
                    style={{strokeDasharray: "none", animation: "none"}}
                />
            ) : null}

            {add ? (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: "absolute",
                            transform: `translate(-50%, -50%) translate(${add.label[0]}px, ${add.label[1]}px)`,
                            pointerEvents: "all",
                            zIndex: 100,
                        }}
                    >
                        <Badge color={"primary"} border>
                            {data!.parameterName}
                            {data!.required ? <span style={{color: "var(--error)"}}>*</span> : null}
                        </Badge>
                    </div>

                    <div
                        style={{
                            position: "absolute",
                            transform: `translate(-50%, -50%) translate(${add.button[0]}px, ${add.button[1]}px)`,
                            pointerEvents: "all",
                            zIndex: 100,
                        }}
                    >
                        <FunctionNodeParameterPortComponent flowId={data!.flowId}
                                                            nodeId={data!.nodeId}
                                                            parameterIndex={data!.parameterIndex!}
                                                            schema={data!.parameterSchema ?? []}
                                                            size={22}/>
                    </div>
                </EdgeLabelRenderer>
            ) : null}

            {label ? (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: "absolute",
                            transform: `translate(-50%, -50%) translate(${labelPosition.x}px, ${labelPosition.y}px)`,
                            pointerEvents: "all",
                            zIndex: 100,
                        }}
                    >
                        <Badge color={"primary"} border>
                            {label}
                            {data?.required ? <span style={{color: "var(--error)"}}>*</span> : null}
                        </Badge>
                    </div>
                </EdgeLabelRenderer>
            ) : null}
        </>
    )
})