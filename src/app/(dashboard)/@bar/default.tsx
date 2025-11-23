"use client";

import {
    Badge,
    Breadcrumb,
    Button, Container,
    Flex,
    MenuItem,
    MenuSeparator,
    Text,
    TextInput, useService,
    useUserSession
} from "@code0-tech/pictor";
import DUserMenu from "@code0-tech/pictor/dist/components/d-user/DUserMenu";
import {IconBuilding, IconInbox, IconLogout, IconSearch, IconSettings} from "@tabler/icons-react";
import React from "react";
import Image from "next/image";
import {UserService} from "@edition/user/User.service";
import {useRouter} from "next/navigation";

const Page = () => {

    const currentSession = useUserSession()
    const userService = useService(UserService)
    const router = useRouter()
    const [loading, startTransition] = React.useTransition()


    const userMenu = React.useMemo(() => {

        if (!currentSession?.token) {
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
            <MenuItem>
                <IconBuilding size={16}/>Organizations
            </MenuItem>
            <MenuItem>
                <IconSettings size={16}/>Settings
            </MenuItem>
            <MenuSeparator/>
            <MenuItem onSelect={userLogout}>
                <IconLogout size={16}/>Logout
            </MenuItem>
        </DUserMenu>
    }, [currentSession])

    return <Container>
        <Flex style={{gap: "0.7rem", flexDirection: "column"}} py={0.7} w={"100%"}>
            <Flex align={"center"} justify={"space-between"}>
                <Flex align={"center"} style={{gap: "1.3rem"}}>
                    <Image src={"/CodeZero_App_MVP.png"} alt={"CodeZero Banner"} width={160} height={0}
                           style={{width: '42px', height: 'auto'}}/>
                    <Breadcrumb>
                        <Text>Application</Text>
                    </Breadcrumb>
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

export default Page