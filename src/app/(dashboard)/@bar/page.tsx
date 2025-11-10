"use client";

import {
    Badge,
    Breadcrumb,
    Button,
    Flex,
    MenuItem,
    MenuSeparator,
    Text,
    TextInput,
    useService, useStore
} from "@code0-tech/pictor";
import DUserMenu from "@code0-tech/pictor/dist/components/d-user/DUserMenu";
import {UserService} from "@core/user/User.service";
import {useRouter} from "next/navigation";
import {IconBuilding, IconInbox, IconLogout, IconSearch, IconSettings} from "@tabler/icons-react";
import React, {memo} from "react";
import Image from "next/image";

const Page = () => {

    const userService = useService(UserService)
    const router = useRouter()
    const currentSession = userService.getUserSession()

    if (!currentSession?.token) {
        return null
    }

    return <Flex style={{gap: "0.7rem", flexDirection: "column"}} py={1.3} w={"100%"}>
        <Flex align={"center"} justify={"space-between"}>
            <Image src={"/CodeZero_Banner_Transparent.png"} alt={"CodeZero Banner"} width={160} height={0}
                   style={{width: '160px', height: 'auto'}}/>
            <Flex align={"center"} style={{gap: "0.7rem"}}>
                <TextInput disabled left={<IconSearch size={16}/>} right={<Badge>⌘K</Badge>} rightType={"icon"}
                           placeholder={"Search..."}/>
                <Button>
                    <IconInbox size={16}/>
                </Button>
                <DUserMenu userId={currentSession.user?.id!!}>
                    <MenuItem>
                        <IconBuilding size={16}/>Organizations
                    </MenuItem>
                    <MenuItem>
                        <IconSettings size={16}/>Settings
                    </MenuItem>
                    <MenuSeparator/>
                    <MenuItem>
                        <IconLogout size={16}/>Logout
                    </MenuItem>
                </DUserMenu>
            </Flex>
        </Flex>
        <Breadcrumb>
            <Text>Application</Text>
        </Breadcrumb>
    </Flex>
}

export default Page