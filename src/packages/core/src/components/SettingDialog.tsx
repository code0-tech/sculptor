"use client"

import React from "react";
import {
    Card,
    Dialog,
    DialogContent,
    DialogOverlay,
    DialogPortal,
    ScrollArea,
    ScrollAreaScrollbar,
    ScrollAreaThumb,
    ScrollAreaViewport,
    SegmentedControl,
    SegmentedControlItem,
    Text,
    Tooltip,
    TooltipContent,
    TooltipPortal,
    TooltipTrigger
} from "@code0-tech/pictor";
import {Tab, TabContent} from "@code0-tech/pictor/dist/components/tab/Tab";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {markDialogPathname} from "@core/util/Navigation.lastPage.util";

export interface SettingDialogTab {
    value: string
    label: string
    icon: React.FC<{ size?: number, style?: React.CSSProperties }>
    content: React.ReactNode
}

export interface SettingDialogProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    title?: string
    description?: string
    defaultValue?: string
    tabs: (SettingDialogTab | undefined)[]
}

export const SettingDialog: React.FC<SettingDialogProps> = (props) => {

    const {open, onOpenChange, title, description, defaultValue, tabs} = props

    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [closing, setClosing] = React.useState(false)
    const route = React.useRef(pathname)

    const visibleTabs = tabs.filter((tab) => !!tab)
    const activeTab = searchParams.get("tab") || defaultValue || visibleTabs[0]?.value

    const onTabChange = (value: string) => {
        const next = new URLSearchParams(searchParams)
        next.set("tab", value)
        router.replace(`${pathname}?${next.toString()}`, {scroll: false})
    }

    React.useEffect(() => {
        setClosing(false)
    }, [pathname, open])

    React.useEffect(() => {
        if (open) markDialogPathname(route.current)
    }, [])

    return <Dialog open={open && !closing && pathname === route.current} onOpenChange={(next) => {
        setClosing(!next)
        onOpenChange?.(next)
    }}>
        <DialogPortal>
            <DialogOverlay/>
            <DialogContent style={{padding: "2px", overflow: "unset"}}
                           w={"75%"}
                           h={"75%"}
                           maw={"1000px"}
                           autoFocus
                           showCloseButton={false}>
                <div style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                }}>
                    <Tab orientation={"vertical"} value={activeTab} onValueChange={onTabChange} w={"100%"} h={"100%"}>
                        <div style={{
                            padding: "2.6rem",
                            left: "0",
                            top: "50%",
                            transform: "translate(-100%, -50%)",
                            maxWidth: "300px",
                            position: "absolute",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end"
                        }}>
                            {/*<Text fz={2} hierarchy={"primary"}>
                            {title}
                        </Text>
                        <Spacing spacing={"xs"}/>
                        <Text maw={"250px"} hierarchy={"tertiary"} style={{textWrap: "wrap"}}>
                            {description}
                        </Text>
                        <Spacing spacing={"xl"}/>*/}
                            <SegmentedControl type={"single"}
                                              color={"secondary"}
                                              style={{
                                                  flexDirection: "column"
                                              }}
                                              value={activeTab}
                                              onValueChange={(value) => value && onTabChange(value)}>
                                {visibleTabs.map((tab) => (
                                    <Tooltip key={tab.value}>
                                        <TooltipTrigger asChild>
                                            <SegmentedControlItem value={tab.value}>
                                                <tab.icon style={{minWidth: "16px", minHeight: "16px"}} size={16}/>
                                            </SegmentedControlItem>
                                        </TooltipTrigger>
                                        <TooltipPortal>
                                            <TooltipContent side={"left"} sideOffset={8} color={"secondary"}>
                                                <Text size={"sm"}>{tab.label}</Text>
                                            </TooltipContent>
                                        </TooltipPortal>
                                    </Tooltip>
                                ))}
                            </SegmentedControl>
                            {/*<DialogClose asChild style={{marginTop: "auto"}}>
                            <Button paddingSize={"xxs"} w={"100%"} variant={"none"} justify={"start"}>
                                <IconArrowLeft size={16}/>
                                <Text size={"md"}>
                                    Go back
                                </Text>
                            </Button>
                        </DialogClose>*/}
                        </div>
                        <Card color={"primary"} p={"0"} paddingSize={"md"} h={"100%"} w={"100%"}>
                            <ScrollArea h={"100%"} type={"scroll"}>
                                <ScrollAreaViewport>
                                    <div style={{maxWidth: "75%", margin: "0 auto", padding: "4rem 1rem"}}>
                                        {visibleTabs.map((tab) => (
                                            <TabContent key={tab.value} tabIndex={-1} value={tab.value} pl={"0.7"}
                                                        style={{overflow: "hidden"}}>
                                                {tab.content}
                                            </TabContent>
                                        ))}
                                    </div>
                                </ScrollAreaViewport>
                                <ScrollAreaScrollbar orientation={"vertical"}>
                                    <ScrollAreaThumb/>
                                </ScrollAreaScrollbar>
                            </ScrollArea>
                        </Card>
                    </Tab>
                </div>

            </DialogContent>
        </DialogPortal>
    </Dialog>

}
