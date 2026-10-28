import React from "react";
import {
    Dialog,
    DialogContent,
    DialogOverlay,
    DialogPortal,
    Spacing,
    useService,
    useStore
} from "@code0-tech/pictor";
import {FlowService} from "@edition/flow/services/Flow.service";
import {FlowTypeService} from "@edition/flowtype/services/FlowType.service";
import {ProjectService} from "@edition/project/services/Project.service";
import {Flow, Namespace, NamespaceProject} from "@code0-tech/sagittarius-graphql-types";
import {FlowExecuteDefaultView} from "@edition/flow/views/FlowExecuteDefaultView";
import {FlowExecuteWebhookView} from "@edition/flow/views/FlowExecuteWebhookView";

export interface FlowExecuteDialogComponentProps {
    flowId: Flow['id']
    namespaceId: Namespace['id']
    projectId: NamespaceProject['id']
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export const FlowExecuteDialogComponent: React.FC<FlowExecuteDialogComponentProps> = (props) => {

    const {flowId, namespaceId, projectId, open, onOpenChange} = props

    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)
    const flowTypeService = useService(FlowTypeService)
    const flowTypeStore = useStore(FlowTypeService)
    const projectService = useService(ProjectService)
    const projectStore = useStore(ProjectService)

    const flow = React.useMemo(
        () => flowService.getById(flowId, {namespaceId, projectId}),
        [flowId, flowStore, namespaceId, projectId]
    )

    const project = React.useMemo(
        () => projectService.getById(projectId, {namespaceId}),
        [projectId, namespaceId, projectStore]
    )

    const flowType = React.useMemo(
        () => flowTypeService.getById(flow?.type?.id, {
            namespaceId,
            projectId,
            runtimeId: project?.primaryRuntime?.id
        }),
        [flow?.type?.id, namespaceId, projectId, project?.primaryRuntime?.id, flowTypeStore]
    )

    const contentViews: Record<string, React.FC> = {
        default: FlowExecuteDefaultView,
        REST: FlowExecuteWebhookView,
    }

    const ContentView = contentViews[flowType?.identifier ?? "default"] ?? contentViews.default

    return <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogPortal>
            <DialogOverlay/>
            <DialogContent showCloseButton title={"Manually execute / test your workflow"}>
                <Spacing spacing={"xl"}/>
                <ContentView/>
            </DialogContent>
        </DialogPortal>
    </Dialog>

}
