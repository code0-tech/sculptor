"use client"

import React from "react";
import {Badge, Button, getSize, Menu, MenuContent, MenuItem, MenuLabel, MenuPortal, MenuTrigger} from "@code0-tech/pictor";
import {IconHelp, IconMessage, IconRoute, IconX} from "@tabler/icons-react";
import {useTutorial} from "@edition/tutorial/hooks/Tutorial.tour.hook";
import {getTutorialLabel} from "@edition/tutorial/utils/Tutorial.label.util";
import {useSupportChat} from "@cloud-internal/support/hooks/Support.chat.hook";
import {useSupportConnection} from "@cloud-internal/support/hooks/Support.connection.hook";
import {SupportChatPanelView} from "@cloud-internal/support/views/SupportChatPanelView";
import {TutorialButtonComponent as CETutorialButtonComponent} from "@ce-internal/tutorial/components/TutorialButtonComponent";
import "driver.js/dist/driver.css";
import "@ce-internal/tutorial/components/TutorialButtonComponent.style.scss";

export const TutorialButtonComponent: React.FC = () => {

    const {level, hasSteps, start} = useTutorial()
    const chat = useSupportChat()
    const available = useSupportConnection()

    const [menuOpen, setMenuOpen] = React.useState(false)

    const unread = React.useMemo(() => chat.conversations
        .reduce((total, conversation) => total + (conversation.unread_message_count || 0), 0), [chat.conversations])

    const width = `min(calc(100vw - 2 * ${getSize("md")}), ${chat.expanded ? "46rem" : "25rem"})`

    const change = React.useCallback((open: boolean) => {
        setMenuOpen(open)
        if (!open) chat.close()
    }, [chat])

    if (!available) return <CETutorialButtonComponent/>

    return <div style={{position: "fixed", right: getSize("md"), bottom: getSize("md"), zIndex: 10}}>
        <Menu modal={false} open={menuOpen || chat.visible} onOpenChange={change}>
            <MenuTrigger asChild>
                <Button data-qa-selector={"dashboard-tutorial"}
                        style={{padding: getSize("xs"), position: "relative"}}
                        color={"secondary"}>
                    {chat.visible ? <IconX size={16}/> : <IconHelp size={16}/>}
                    {unread && !chat.visible ? <Badge color={"info"} style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        transform: "translate(35%, -35%)"
                    }}>
                        {unread}
                    </Badge> : null}
                </Button>
            </MenuTrigger>
            <MenuPortal>
                <MenuContent color={"primary"} side={"top"} align={"end"} sideOffset={8}
                             w={chat.visible ? width : undefined}
                             onInteractOutside={event => {
                                 if (chat.visible) event.preventDefault()
                             }}>
                    {chat.visible ? <SupportChatPanelView/> : <>
                        <MenuLabel>How can we help?</MenuLabel>
                        {hasSteps && <MenuItem onSelect={start}>
                            <IconRoute size={13}/>
                            {getTutorialLabel(level)}
                        </MenuItem>}
                        <MenuItem onSelect={event => {
                            event.preventDefault()
                            chat.open()
                        }}>
                            <IconMessage size={13}/>
                            {unread ? `Support team replied (${unread})` : "Start a conversation with support team"}
                        </MenuItem>
                    </>}
                </MenuContent>
            </MenuPortal>
        </Menu>
    </div>
}
