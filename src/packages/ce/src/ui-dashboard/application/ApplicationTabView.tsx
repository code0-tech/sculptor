"use client"

import React from "react";
import {Tab, TabList, TabTrigger} from "@code0-tech/pictor/dist/components/tab/Tab";
import {Badge, Button, Container, useService, useStore, useUserSession} from "@code0-tech/pictor";
import {IconBuilding, IconHome, IconServer, IconSettings, IconUser} from "@tabler/icons-react";
import {usePathname, useRouter} from "next/navigation";
import {UserService} from "@edition/user/User.service";
import {RuntimeService} from "@edition/runtime/Runtime.service";
import {OrganizationService} from "@edition/organization/Organization.service";
import {hashToColor} from "@code0-tech/pictor/dist/components/d-flow/DFlow.util";

export const ApplicationTabView: React.FC = () => {

    const pathname = usePathname()
    const router = useRouter()
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
                <TabTrigger value={"users"} asChild={true}>
                    <Button variant={"none"} color={"primary"} paddingSize={"xs"} onClick={() => router.push("/users")}>
                        <IconUser size={16}/>
                    </Button>
                </TabTrigger>
                <TabTrigger value={"runtimes"} asChild={true}>
                    <Button variant={"none"} color={"primary"} paddingSize={"xs"} onClick={() => router.push("/runtimes")}>
                        <IconServer size={16}/>
                    </Button>
                </TabTrigger>
                <TabTrigger value={"settings"} asChild={true}>
                    <Button variant={"none"} color={"primary"} paddingSize={"xs"} onClick={() => router.push("/settings")}>
                        <IconSettings color={hashToColor("settings")} size={16}/>
                    </Button>

                </TabTrigger>
            </>
        ) : null
    }, [currentUser, runtimeStore, organizationStore])

    return <Tab defaultValue={defaultValue} orientation={"vertical"}>
            <TabList>
                <TabTrigger value={"overview"} asChild={true}>
                    <Button variant={"none"} color={"primary"} paddingSize={"xs"} onClick={() => router.push("/")}>
                        <IconHome color={hashToColor("home")} size={16}/>
                    </Button>
                </TabTrigger>
                <TabTrigger value={"organizations"} asChild={true}>
                    <Button variant={"none"} color={"primary"} paddingSize={"xs"} onClick={() => router.push("/organizations")}>
                        <IconBuilding size={16}/>
                    </Button>
                </TabTrigger>
                {adminLinks}
            </TabList>
        </Tab>
}