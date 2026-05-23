import React from "react";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup
} from "@code0-tech/pictor/dist/components/resizable/Resizable";
import {SidebarComponent} from "@core/components/SidebarComponent";
import {UIEditorComponent} from "@edition/ui/components/UIEditorComponent";
import {UIEditorHistoryPanelView} from "@edition/ui/views/UIEditorHistoryPanelView";
import {UIEditorControlPanelView} from "@edition/ui/views/UIEditorControlPanelView";
import {Puck} from "@puckeditor/core";
import {
    Button,
    Flex, hashToColor, mergeComponentProps,
    Text,
    Tooltip,
    TooltipArrow,
    TooltipContent,
    TooltipPortal,
    TooltipTrigger
} from "@code0-tech/pictor";
import {IconArrowsMaximize, IconArrowsMinimize, IconCircleDot, IconFile, IconPlus} from "@tabler/icons-react";
import {ButtonGroup} from "@code0-tech/pictor/dist/components/button-group/ButtonGroup";
import {Layout} from "@code0-tech/pictor/dist/components/layout/Layout";

export const UIEditorPage: React.FC = () => {
    return <ResizablePanelGroup>
        <SidebarComponent title={"Explorer"} id={"1"}>
            <Layout layoutGap={"0.7rem"} showLayoutSplitter={false} topContent={
                <Flex style={{flexDirection: "column", gap: "0.7rem"}}>
                    <Flex style={{gap: "0.35rem"}} align={"center"} justify={"space-between"}>
                        <Button data-qa-selector={"flow-send"} color={"tertiary"} paddingSize={"xxs"}
                                style={{textWrap: "nowrap"}}>
                            <IconPlus size={13}/>
                            Create page
                        </Button>
                        <ButtonGroup color={"secondary"} style={{boxShadow: "none"}} p={0}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant={"none"} paddingSize={"xxs"}>
                                        <IconCircleDot size={13}/>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipPortal>
                                    <TooltipContent side={"bottom"}>
                                        <Text>Open active flow</Text>
                                        <TooltipArrow/>
                                    </TooltipContent>
                                </TooltipPortal>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant={"none"} paddingSize={"xxs"}>
                                        <IconArrowsMinimize size={13}/>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipPortal>
                                    <TooltipContent side={"bottom"}>
                                        <Text>Close all</Text>
                                        <TooltipArrow/>
                                    </TooltipContent>
                                </TooltipPortal>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button paddingSize={"xxs"} variant={"none"}>
                                        <IconArrowsMaximize size={13}/>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipPortal>
                                    <TooltipContent side={"bottom"}>
                                        <Text>Open all</Text>
                                        <TooltipArrow/>
                                    </TooltipContent>
                                </TooltipPortal>
                            </Tooltip>
                        </ButtonGroup>
                    </Flex>
                </Flex>
            }>
                <Button w={"100%"} color={"tertiary"} paddingSize={"xxs"} justify={"start"}>
                    <Flex align={"center"} style={{gap: "0.35rem"}}>
                        <IconFile color={hashToColor("")} size={12}/>
                        <Text>Test</Text>
                    </Flex>
                </Button>
            </Layout>
        </SidebarComponent>
        <ResizableHandle/>
        <ResizablePanel id={"2"}>
            <UIEditorComponent>
                <ResizablePanelGroup orientation={"horizontal"}>
                    <ResizablePanel id={"3"}
                                    color={"primary"}
                                    style={{borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem"}}>
                        {/*<UIEditorHistoryPanelView/>*/}
                        <UIEditorControlPanelView/>
                        <Puck.Preview/>
                    </ResizablePanel>
                    <ResizableHandle/>
                    <ResizablePanel id={"4"}
                                    defaultSize={"25%"}
                                    color={"primary"}
                                    style={{borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem"}}>
                        <Puck.Fields/>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </UIEditorComponent>
        </ResizablePanel>
    </ResizablePanelGroup>
}
