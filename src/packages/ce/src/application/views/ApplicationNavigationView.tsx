"use client"

import React, {startTransition} from "react";
import {
    Avatar,
    Button,
    Flex,
    Icon,
    Menu,
    MenuContent,
    MenuItem,
    MenuLabel,
    MenuPortal,
    MenuSeparator,
    MenuTrigger,
    Text,
    Tooltip,
    TooltipContent,
    TooltipPortal,
    TooltipTrigger,
    useService,
    useStore
} from "@code0-tech/pictor";
import {
    IconAdjustmentsFilled,
    IconApps,
    IconArrowAutofitLeft,
    IconArrowAutofitLeftFilled,
    IconHomeFilled,
    IconSettingsFilled,
    IconUser
} from "@tabler/icons-react";
import Link from "next/link";
import {UserService} from "@edition/user/services/User.service";
import {useUserSession} from "@edition/user/hooks/User.session.hook";
import {useRouter} from "next/navigation";

export const ApplicationNavigationView: React.FC = () => {


    const userService = useService(UserService)
    const userStore = useStore(UserService)

    const router = useRouter()
    const currentSession = useUserSession()
    const currentUser = React.useMemo(
        () => userService.getById(currentSession?.user?.id),
        [userStore, currentSession]
    )
    const userNamespaceIndex = React.useMemo(
        () => currentUser?.namespace?.id?.match(/Namespace\/(\d+)$/)?.[1],
        [currentUser]
    )

    const userLogout = () => {

        if (!currentSession || !currentSession.id) return

        startTransition(async () => {
            await userService.usersLogout({
                userSessionId: currentSession.id!!
            }).then(payload => {
                window.localStorage.removeItem("ide_code-zero_session")
                router.push("/login")
            })
        })
    }

    return <Flex h={"100%"} style={{boxSizing: "border-box", flexDirection: 'column', gap: "0.7rem"}}>
        <Tooltip>
            <TooltipTrigger asChild>
                <Link href={"/"} prefetch>
                    <Button variant={"none"} p={0.5}>
                        <Icon icon={"codezero:codezero"} color={"#fff"} size={16}/>
                    </Button>
                </Link>
            </TooltipTrigger>
            <TooltipPortal>
                <TooltipContent color={"primary"} side={"left"} sideOffset={8}>
                    <Text>
                        Home
                    </Text>
                </TooltipContent>
            </TooltipPortal>
        </Tooltip>
        {currentUser?.admin && (
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link href={"/settings"} prefetch>
                        <Button variant={"none"} p={0.5}>
                            <IconAdjustmentsFilled color={"#fff"} size={16}/>
                        </Button>
                    </Link>
                </TooltipTrigger>
                <TooltipPortal>
                    <TooltipContent color={"primary"} side={"left"} sideOffset={8}>
                        <Text>
                            Application Settings
                        </Text>
                    </TooltipContent>
                </TooltipPortal>
            </Tooltip>
        )}
        <Flex style={{marginTop: "auto", boxSizing: "border-box", flexDirection: 'column', gap: "0.7rem"}}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link href={"/users/@me/settings"} prefetch>
                        <Button variant={"none"} p={0.5} style={{marginTop: 'auto'}}>
                            <IconSettingsFilled color={"#fff"} size={16}/>
                        </Button>
                    </Link>
                </TooltipTrigger>
                <TooltipPortal>
                    <TooltipContent color={"primary"} side={"left"} sideOffset={8}>
                        <Text>
                            User Settings
                        </Text>
                    </TooltipContent>
                </TooltipPortal>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button onClick={userLogout} variant={"none"} p={0.5} style={{marginTop: 'auto'}}>
                        <IconArrowAutofitLeftFilled color={"#fff"} size={16}/>
                    </Button>
                </TooltipTrigger>
                <TooltipPortal>
                    <TooltipContent color={"primary"} side={"left"} sideOffset={8}>
                        <Text>
                            Logout
                        </Text>
                    </TooltipContent>
                </TooltipPortal>
            </Tooltip>
            <Menu>
                <MenuTrigger asChild>
                    <Button variant={"none"} p={0.5} style={{marginTop: 'auto'}}>
                        <Avatar type={"character"} identifier={currentUser?.username ?? ""} size={16}/>
                    </Button>
                </MenuTrigger>
                <MenuPortal>
                    <MenuContent align={"end"} alignOffset={-4} side={"right"} sideOffset={8}>
                        <MenuLabel>
                            User menu
                        </MenuLabel>
                        <Link href={`/users/@me`}>
                            <MenuItem>
                                <IconUser size={16}/>Profile
                            </MenuItem>
                        </Link>
                        <Link href={`/users/@me/settings`}>
                            <MenuItem>
                                <IconUser color={"transparent"} size={16}/>Settings
                            </MenuItem>
                        </Link>
                        <MenuSeparator/>
                        <Link href={"/"}>
                            <MenuItem>
                                <IconApps size={16}/>Workspaces
                            </MenuItem>
                        </Link>
                        <Link href={`/namespace/${userNamespaceIndex}`}>
                            <MenuItem>
                                <IconApps color={"transparent"} size={16}/>Personal Workspace
                            </MenuItem>
                        </Link>
                        <MenuSeparator/>
                        <MenuItem onSelect={userLogout}>
                            <IconArrowAutofitLeft size={16}/>Logout
                        </MenuItem>
                    </MenuContent>
                </MenuPortal>
            </Menu>
        </Flex>
    </Flex>
}