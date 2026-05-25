import React from "react";
import {Panel} from "@xyflow/react";
import {Badge, Button, ButtonGroup, Text, Tooltip, TooltipContent, TooltipPortal, TooltipTrigger} from "@code0-tech/pictor";
import {UIEditorAddDialogComponent} from "@edition/ui/components/UIEditorAddDialogComponent";
import {useHotkeys} from "react-hotkeys-hook";
import {usePuck} from "@edition/ui/components/UIEditorComponent";
import { useParams, useRouter } from "next/navigation";

export const UIEditorControlPanelView: React.FC = () => {
    const [suggestionDialogOpen, setSuggestionDialogOpen] = React.useState(false)
    const router = useRouter()
    const params = useParams()

    const itemSelector = usePuck((state) => state.appState.ui.itemSelector)
    const dispatch = usePuck((state) => state.dispatch)
    const selected = Boolean(itemSelector)

    const namespaceId = params.namespaceId as any
    const projectId = params.projectId as any

    const deleteSelectedComponent = () => {
        if (!itemSelector) return

        dispatch({
            type: "remove",
            index: itemSelector.index,
            zone: itemSelector.zone ?? "root",
        })
        dispatch({
            type: "setUi",
            ui: {
                itemSelector: null,
            },
        })
    }

    useHotkeys('shift+a', (keyboardEvent) => {
        setSuggestionDialogOpen(true)
        keyboardEvent.stopPropagation()
        keyboardEvent.preventDefault()
    })

    return (
        <Panel position={"bottom-center"}>
            <UIEditorAddDialogComponent
                open={suggestionDialogOpen}
                onOpenChange={setSuggestionDialogOpen}
            />

            <ButtonGroup style={{textWrap: "nowrap"}}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            data-qa-selector={"flow-builder-control-panel-delete"}
                            paddingSize={"xxs"}
                            variant={"filled"}
                            color={"error"}
                            disabled={!selected}
                            onClick={deleteSelectedComponent}
                        >
                            <Text>Delete component</Text>
                        </Button>
                    </TooltipTrigger>
                    <TooltipPortal>
                        <TooltipContent sideOffset={8}>
                            <Text>
                                {selected
                                    ? "Delete selected component"
                                    : "Select a component to delete it"}
                            </Text>
                        </TooltipContent>
                    </TooltipPortal>
                </Tooltip>

                <Button
                    data-qa-selector={"flow-builder-control-panel-add"}
                    paddingSize={"xxs"}
                    variant={"none"}
                    onClick={() => setSuggestionDialogOpen(true)}
                    color={"secondary"}
                >
                    <Text display={"flex"} align={"center"} style={{gap: "0.35rem"}}>
                        Add next component
                        <Badge style={{gap: 0}}>Shift + A</Badge>
                    </Text>
                </Button>

                <Button
                    variant={"filled"}
                    color={"success"}
                    paddingSize={"xxs"}
                    onClick={() => router.push(`/namespace/${namespaceId}/project/${projectId}/ui`)}
                >
                    Save changes
                </Button>
            </ButtonGroup>
        </Panel>
    )
}
