"use client";

import {Badge, Breadcrumb, Flex, MenuItem, MenuSeparator, Text, TextInput, useService} from "@code0-tech/pictor";
import DUserMenu from "@code0-tech/pictor/dist/components/d-user/DUserMenu";
import {UserService} from "@core/user/User.service";
import {useRouter} from "next/navigation";
import {IconBuilding, IconLogout, IconSearch, IconSettings} from "@tabler/icons-react";
import React, {memo} from "react";
import Image from "next/image";

const Page = memo(() => {

    const userService = useService(UserService)
    const router = useRouter()
    const currentSession = userService.getUserSession()

    if (!currentSession?.token) {
        return null
    }

    return <Flex style={{gap: "0.7rem", flexDirection: "column"}} py={1.3} w={"100%"}>
        <Flex align={"center"} justify={"space-between"}>
            <Flex align={"center"} style={{gap: "1.3rem"}}>
                <Image src={"/CodeZero_Banner_Transparent.png"} alt={"CodeZero Banner"} width={150} height={0}
                       style={{width: '150px', height: 'auto'}}/>
                <TextInput disabled left={<IconSearch size={16}/>} right={<Badge>⌘K</Badge>} rightType={"icon"}
                           placeholder={"Search..."} w={"33vw"}/>
            </Flex>
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
        <Breadcrumb>
            <Text>Application</Text>
        </Breadcrumb>
    </Flex>
})

export default Page