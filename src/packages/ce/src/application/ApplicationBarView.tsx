"use client"

import {
    Avatar,
    Badge,
    Button,
    Flex,
    MenuItem,
    MenuSeparator,
    TextInput,
    useService,
    useStore,
    useUserSession
} from "@code0-tech/pictor";
import {UserService} from "@edition/user/services/User.service";
import {useRouter} from "next/navigation";
import React from "react";
import DUserMenu from "@code0-tech/pictor/dist/components/d-user/DUserMenu";
import Link from "next/link";
import {IconBuilding, IconFolders, IconInbox, IconLogout, IconSearch} from "@tabler/icons-react";
import {ApplicationBreadcrumbView} from "@edition/application/ApplicationBreadcrumbView";

export const ApplicationBarView: React.FC = () => {

    const currentSession = useUserSession()
    const userService = useService(UserService)
    const userStore = useStore(UserService)
    const router = useRouter()
    const [loading, startTransition] = React.useTransition()

    const currentUser = React.useMemo(() => userService.getById(currentSession?.user?.id), [userStore, currentSession])
    const namespaceIndex = React.useMemo(() => currentUser?.namespace?.id?.match(/Namespace\/(\d+)$/)?.[1], [currentUser])

    const userMenu = React.useMemo(() => {

        if (!currentUser || !currentSession) {
            return null
        }

        const userLogout = () => {
            startTransition(async () => {
                await userService.usersLogout({
                    userSessionId: currentSession.id!!
                }).then(payload => {
                    window.localStorage.removeItem("ide_code-zero_session")
                    router.push("/login")
                })
            })
        }

        return <DUserMenu userId={currentSession.user?.id!!}>
            <Link href={"/organizations"}>
                <MenuItem>
                    <IconBuilding size={16}/>Organizations
                </MenuItem>
            </Link>
            <Link href={`/namespace/${namespaceIndex}`}>
                <MenuItem>
                    <IconFolders size={16}/>Personal Workspace
                </MenuItem>
            </Link>
            <MenuSeparator/>
            <MenuItem onSelect={userLogout}>
                <IconLogout size={16}/>Logout
            </MenuItem>
        </DUserMenu>
    }, [currentUser, currentSession, namespaceIndex])

    return <Flex py={0.7} align={"center"} justify={"space-between"}>
        <ApplicationBreadcrumbView/>
        <Flex align={"center"} style={{gap: ".7rem"}}>
            <Button disabled variant={"none"} paddingSize={"xs"}>
                <IconSearch size={16}/>
            </Button>
            <Button disabled variant={"none"} paddingSize={"xs"}>
                <IconInbox size={16}/>
            </Button>
            {userMenu}
        </Flex>
    </Flex>
}