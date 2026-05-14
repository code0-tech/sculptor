import React from "react";
import {Panel} from "@xyflow/react";
import {Badge, Button, Text, Tooltip, TooltipContent, TooltipPortal, TooltipTrigger} from "@code0-tech/pictor";
import {ButtonGroup} from "@code0-tech/pictor/dist/components/button-group/ButtonGroup";
import {UIEditorAddDialogComponent} from "@edition/ui/components/UIEditorAddDialogComponent";
import {useHotkeys} from "react-hotkeys-hook";

export const UIEditorControlPanelView: React.FC = () => {

    const [suggestionDialogOpen, setSuggestionDialogOpen] = React.useState(false)

    useHotkeys('shift+a', (keyboardEvent) => {
        setSuggestionDialogOpen(true)
        keyboardEvent.stopPropagation()
        keyboardEvent.preventDefault()
    })

    return <Panel position={"bottom-center"}>

        <UIEditorAddDialogComponent open={suggestionDialogOpen}
                                    onOpenChange={setSuggestionDialogOpen}/>

        <ButtonGroup style={{textWrap: "nowrap"}}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button data-qa-selector={"flow-builder-control-panel-delete"}
                            paddingSize={"xxs"}
                            variant={"filled"}
                            color={"error"}>
                        <Text>Delete component</Text>
                    </Button>
                </TooltipTrigger>
                <TooltipPortal>
                    <TooltipContent sideOffset={8}>
                        <Text>Select a component to delete it</Text>
                    </TooltipContent>
                </TooltipPortal>
            </Tooltip>
            <Button data-qa-selector={"flow-builder-control-panel-add"}
                    paddingSize={"xxs"}
                    variant={"none"}
                    onClick={() => setSuggestionDialogOpen(true)}
                    color={"secondary"}>
                <Text display={"flex"} align={"center"} style={{gap: "0.35rem"}}>
                    Add next component
                    <Badge style={{gap: 0}}>Shift + A</Badge>
                </Text>
            </Button>
            <Button variant={"none"} color={"secondary"} paddingSize={"xxs"}>
                View this page
            </Button>
        </ButtonGroup>
    </Panel>
}