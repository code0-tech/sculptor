import { SidebarComponent } from "@/packages/core/src/components/SidebarComponent"
import { Text, Button, ButtonGroup, Flex, Layout, Tooltip, TooltipContent, TooltipPortal, TooltipTrigger, TooltipArrow, hashToColor } from "@code0-tech/pictor"
import { IconArrowsMaximize, IconArrowsMinimize, IconCircleDot, IconFile, IconPlus } from "@tabler/icons-react"

export const UIEditorSidebarView: React.FC = () => {
    return (
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
    )
}
