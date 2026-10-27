import React, {CSSProperties} from "react";
import {useService, useStore as usePictorStore} from "@code0-tech/pictor";
import {NodeFunction} from "@code0-tech/sagittarius-graphql-types";
import {FlowService} from "@edition/flow/services/Flow.service";
import {FunctionService} from "@edition/function/services/Function.service";
import {ModuleService} from "@edition/module/services/Module.service";
import {useFlowValidation} from "@edition/flow/hooks/Flow.validation.hook";
import {underlineBySeverity} from "@core/util/inspection";
import {icon, IconString} from "@core/util/icons";
import {FALLBACK_FUNCTION_NAME} from "@core/util/fallback-translations";
import {useSelectedFunctionNode} from "@edition/function/hooks/FunctionNode.selected.hook";
import {useReferencedNodeIds} from "@edition/flow/hooks/Flow.references.hook";
import {useFlowReferenceHoverStore} from "@edition/flow/hooks/Flow.reference.hover.hook";
import {FunctionNodeComponentProps} from "@edition/function/components/nodes/FunctionNodeComponent";

export interface FunctionNodeState {
    name: string
    moduleName?: string
    displayIcon: ReturnType<typeof icon>
    iconColor: string
    validationStyle: CSSProperties
    isActive: boolean
    isHighlighted: boolean
    isDimmed: boolean
}

export const useFunctionNodeState = (data: FunctionNodeComponentProps, id: string): FunctionNodeState => {

    const flowService = useService(FlowService)
    const flowStore = usePictorStore(FlowService)
    const functionService = useService(FunctionService)
    const functionStore = usePictorStore(FunctionService)
    const moduleService = useService(ModuleService)
    const moduleStore = usePictorStore(ModuleService)

    const selectedNode = useSelectedFunctionNode()
    const referencedNodeIds = useReferencedNodeIds(data.flowId)
    const hoveredNodeId = useFlowReferenceHoverStore(state => state.hoveredNodeId)
    const validation = useFlowValidation(data.flowId)

    const node = React.useMemo(
        () => flowService.getNodeById(data.flowId, data.nodeId),
        [flowStore, data]
    )

    const definition = React.useMemo(
        () => functionService.getById(node?.functionDefinition?.id || data.functionId),
        [functionStore, data, node]
    )

    const module = React.useMemo(
        () => moduleService.getById(definition?.runtimeModule?.id),
        [moduleStore, definition]
    )

    const nodeValidations = React.useMemo(
        () => validation?.filter(nodeValidation => nodeValidation.nodeId === data.nodeId && !data.functionId),
        [validation]
    )

    const isReferenced = React.useMemo(() => {

        const activeNode = flowService.getNodeById(data.flowId, selectedNode?.id as NodeFunction['id'])
        const isActiveNodeReferencingCurrentNode = activeNode?.parameters?.nodes?.some(parameter => parameter?.value?.__typename === "ReferenceValue" && parameter.value.nodeFunctionId === node?.id)
        const hasReferences = activeNode?.parameters?.nodes?.some(parameter => parameter?.value?.__typename === "ReferenceValue")

        if (isActiveNodeReferencingCurrentNode) return true
        if (hasReferences && selectedNode?.id !== data.nodeId) return false

        return undefined

    }, [flowStore, selectedNode, data.flowId, node])

    return {
        name: definition?.names?.[0]?.content ?? FALLBACK_FUNCTION_NAME,
        moduleName: module?.names?.[0]?.content ?? module?.identifier ?? undefined,
        displayIcon: icon(definition?.displayIcon as IconString),
        iconColor: referencedNodeIds.has(id) || hoveredNodeId === id ? data.color : "rgba(255,255,255,0.75)",
        validationStyle: nodeValidations?.length ? underlineBySeverity[nodeValidations[0].type] : {},
        isActive: selectedNode?.id === id,
        isHighlighted: isReferenced === true || hoveredNodeId === id,
        isDimmed: isReferenced === false
    }
}
