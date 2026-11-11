import React from "react";
import {
    Button,
    Dialog,
    DialogClose,
    DialogContent,
    DialogOverlay,
    DialogPortal,
    Flex,
    getSize,
    Spacing,
    Text,
    useService,
    useStore
} from "@code0-tech/pictor";
import {IconX} from "@tabler/icons-react";
import {FlowService} from "@edition/flow/services/Flow.service";
import {FlowTypeService} from "@edition/flowtype/services/FlowType.service";
import {ProjectService} from "@edition/project/services/Project.service";
import {Flow, Namespace, NamespaceProject} from "@code0-tech/sagittarius-graphql-types";
import {FlowExecuteDefaultView} from "@edition/flow/views/FlowExecuteDefaultView";
import {FlowExecuteWebhookView} from "@edition/flow/views/FlowExecuteWebhookView";
import {FlowExecuteOpenAiView} from "@edition/flow/views/FlowExecuteOpenAiView";

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
        "ai::openai::server": FlowExecuteOpenAiView,
    }

    const ContentView = contentViews[flowType?.identifier ?? "default"] ?? contentViews.default

    return <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogPortal>
            <DialogOverlay/>
            <DialogContent>
                <Flex align={"center"} justify={"space-between"} style={{gap: getSize("sm")}}>
                    <Text size={"lg"} hierarchy={"primary"} ta={"left"}>
                        Manually execute / test your workflow
                    </Text>
                    <DialogClose asChild>
                        <Button variant={"none"} style={{padding: getSize("xs")}}>
                            <IconX size={16}/>
                        </Button>
                    </DialogClose>
                </Flex>
                <Spacing spacing={"xl"}/>
                <ContentView/>
            </DialogContent>
        </DialogPortal>
    </Dialog>

}
