"use client"

import React from "react";
import {Tab, TabList, TabTrigger} from "@code0-tech/pictor/dist/components/tab/Tab";
import {Badge, Button, Container, useService, useStore, useUserSession} from "@code0-tech/pictor";
import {IconBuilding, IconHome, IconServer, IconSettings, IconUser} from "@tabler/icons-react";
import {usePathname} from "next/navigation";
import Link from "next/link";
import {UserService} from "@edition/user/User.service";
import {RuntimeService} from "@edition/runtime/Runtime.service";
import {OrganizationService} from "@edition/organization/Organization.service";

export const ApplicationTabView: React.FC = () => {

    const pathname = usePathname()
    const userService = useService(UserService)
    const runtimeService = useService(RuntimeService)
    const runtimeStore = useStore(RuntimeService)
    const organizationService = useService(OrganizationService)
    const organizationStore = useStore(OrganizationService)
    const userStore = useStore(UserService)
    const currentSession = useUserSession()
    const currentUser = React.useMemo(() => userService.getById(currentSession?.user?.id), [userStore, currentSession])
    const defaultValue = pathname.includes("organizations") ? "organizations"
        : pathname.includes("users") ? "users"
            : pathname.includes("settings") ? "settings"
                : pathname.includes("runtimes") ? "runtimes"
                    : "overview"


    const adminLinks = React.useMemo(() => {
        return currentUser && currentUser.admin ? (
            <>
                <TabTrigger value={"users"}>
                    <Link href={"/users"}>
                        <Button variant={"none"}>
                            <IconUser size={16}/>
                            Users
                            <Badge>{userService.values().length}</Badge>
                        </Button>
                    </Link>
                </TabTrigger>
                <TabTrigger value={"runtimes"}>
                    <Link href={"/runtimes"}>
                        <Button variant={"none"}>
                            <IconServer size={16}/>
                            Runtimes
                            <Badge>{runtimeService.values().length}</Badge>
                        </Button>
                    </Link>
                </TabTrigger>
                <TabTrigger value={"settings"}>
                    <Link href={"/settings"}>
                        <Button variant={"none"}>
                            <IconSettings size={16}/>
                            Settings
                        </Button>
                    </Link>
                </TabTrigger>
            </>
        ) : null
    }, [currentUser, runtimeStore, organizationStore])

    return <Container>
        <Tab defaultValue={defaultValue}>
            <TabList>
                <TabTrigger value={"overview"}>
                    <Link href={"/"}>
                        <Button variant={"none"}>
                            <IconHome size={16}/>
                            Overview
                        </Button>
                    </Link>
                </TabTrigger>
                <TabTrigger value={"organizations"}>
                    <Link href={"/organizations"}>
                        <Button variant={"none"}>
                            <IconBuilding size={16}/>
                            Organizations
                            <Badge>{organizationService.values().length}</Badge>
                        </Button>
                    </Link>
                </TabTrigger>
                {adminLinks}
            </TabList>
        </Tab>
    </Container>
}