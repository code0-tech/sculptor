"use client"

import {
    Badge,
    Button,
    Container,
    Flex,
    MenuItem,
    MenuSeparator,
    TextInput,
    useService,
    useUserSession
} from "@code0-tech/pictor";
import {UserService} from "@edition/user/User.service";
import {useRouter} from "next/navigation";
import React from "react";
import DUserMenu from "@code0-tech/pictor/dist/components/d-user/DUserMenu";
import Link from "next/link";
import {IconBuilding, IconFolders, IconInbox, IconLogout, IconSearch} from "@tabler/icons-react";
import Image from "next/image";
import {ApplicationBreadcrumbView} from "@edition/dashboard/application/ApplicationBreadcrumbView";

export const ApplicationBarView: React.FC = () => {

    const currentSession = useUserSession()
    const userService = useService(UserService)
    const userStore = useService(UserService)
    const router = useRouter()
    const [loading, startTransition] = React.useTransition()

    const currentUser = React.useMemo(() => userService.getById(currentSession?.user?.id), [userStore, currentSession])

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

        const namespaceIndex = currentUser?.namespace?.id?.match(/Namespace\/(\d+)$/)?.[1]

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
    }, [currentUser, currentSession])

    return <Container>
        <Flex style={{gap: "0.7rem", flexDirection: "column"}} py={0.7} w={"100%"}>
            <Flex align={"center"} justify={"space-between"}>
                <Flex align={"center"} style={{gap: "1.3rem"}}>
                    <Image src={"/CodeZero_Logo.png"} alt={"CodeZero Banner"} width={160} height={0}
                           style={{width: '38px', height: 'auto'}}/>
                    <ApplicationBreadcrumbView/>
                </Flex>
                <Flex align={"center"} style={{gap: "0.7rem"}}>
                    <TextInput disabled left={<IconSearch size={16}/>} right={<Badge>⌘K</Badge>} rightType={"icon"}
                               placeholder={"Search..."}/>
                    <Button>
                        <IconInbox size={16}/>
                    </Button>
                    {userMenu}
                </Flex>
            </Flex>
        </Flex>
    </Container>
}