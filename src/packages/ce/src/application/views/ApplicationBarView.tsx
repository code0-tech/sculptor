"use client"

import {Button, Flex, MenuItem, MenuSeparator, Text, useService, useStore} from "@code0-tech/pictor";
import {UserService} from "@edition/user/services/User.service";
import {useParams, useRouter} from "next/navigation";
import React from "react";
import Link from "next/link";
import {IconBuilding, IconFolders, IconInbox, IconLogout, IconSearch, IconUser} from "@tabler/icons-react";
import {ApplicationBreadcrumbView} from "@edition/application/views/ApplicationBreadcrumbView";
import UserMenuComponent from "@edition/user/components/UserMenuComponent";
import {useUserSession} from "@edition/user/hooks/User.session.hook";
import {Island} from "@code0-tech/pictor/dist/components/island/Island";
import {ButtonGroup} from "@code0-tech/pictor/dist/components/button-group/ButtonGroup";

export const ApplicationBarView: React.FC = () => {

    const currentSession = useUserSession()
    const userService = useService(UserService)
    const userStore = useStore(UserService)
    const router = useRouter()
    const [loading, startTransition] = React.useTransition()
    const params = useParams()

    const namespaceIndex = params.namespaceId as string | undefined
    const projectIndex = params.projectId as string | undefined
    const currentUser = React.useMemo(() => userService.getById(currentSession?.user?.id), [userStore, currentSession])
    const userNamespaceIndex = React.useMemo(() => currentUser?.namespace?.id?.match(/Namespace\/(\d+)$/)?.[1], [currentUser])
    const userIndex = currentUser?.id?.match(/User\/(\d+)$/)?.[1]
    const currentStep = projectIndex ? "project" : namespaceIndex ? "namespace" : "home";

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

        return <UserMenuComponent userId={currentSession.user?.id!!}>
            <Link href={`/users/${userIndex}`}>
                <MenuItem>
                    <IconUser size={16}/>Profile
                </MenuItem>
            </Link>
            <MenuSeparator/>
            <Link href={"/organizations"}>
                <MenuItem>
                    <IconBuilding size={16}/>Organizations
                </MenuItem>
            </Link>
            <Link href={`/namespace/${userNamespaceIndex}`}>
                <MenuItem>
                    <IconFolders size={16}/>Personal Workspace
                </MenuItem>
            </Link>
            <MenuSeparator/>
            <MenuItem onSelect={userLogout}>
                <IconLogout size={16}/>Logout
            </MenuItem>
        </UserMenuComponent>
    }, [currentUser, currentSession, userNamespaceIndex])

    return <Flex py={0.7} key={`island-${currentStep}`} align={"center"} justify={"space-between"}>
        <ApplicationBreadcrumbView/>
        <Flex pos={"fixed"} top={"1rem"} left={"50%"} justify={"center"}
              style={{zIndex: 9999, transform: "translateX(-50%)"}}>
            <Island>
                <ButtonGroup color={"primary"} bg={"transparent"} style={{boxShadow: "none"}}>
                    <Button paddingSize={"xxs"} key={"home-button"} variant={"none"}
                            aria-selected={!namespaceIndex && !projectIndex} onClick={() => router.push(`/`)}>
                        <Text>Home</Text>
                    </Button>
                    {namespaceIndex ? (
                        <Button paddingSize={"xxs"} key={"orga-button"} variant={"none"}
                                onClick={() => router.push(`/namespace/${namespaceIndex}`)}
                                aria-selected={!!namespaceIndex && !projectIndex}>
                            <Text>Organization</Text>
                        </Button>
                    ) : (null as any)}
                    {namespaceIndex && projectIndex ? (
                        <Button paddingSize={"xxs"} key={"home-button"} variant={"none"}
                                onClick={() => router.push(`/namespace/${namespaceIndex}/project/${projectIndex}/flow`)}
                                aria-selected={!!namespaceIndex && !!projectIndex}>
                            <Text>Project</Text>
                        </Button>
                    ) : (null as any)}
                </ButtonGroup>

            </Island>
        </Flex>
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