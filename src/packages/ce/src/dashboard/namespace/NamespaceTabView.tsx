"use client"

import React from "react";
import {Button, Container} from "@code0-tech/pictor";
import {Tab, TabList, TabTrigger} from "@code0-tech/pictor/dist/components/tab/Tab";
import {IconFolders, IconHome, IconServer, IconSettings, IconUserCog, IconUsers} from "@tabler/icons-react";
import Link from "next/link";
import {useParams, usePathname} from "next/navigation";

export const NamespaceTabView: React.FC = () => {

    const params = useParams()
    const pathname = usePathname()
    const baseLink = `/namespace/${params.namespaceId}`
    const defaultValue = pathname.includes("projects") ? "projects"
        : pathname.includes("members") ? "members"
            : pathname.includes("roles") ? "roles"
                : pathname.includes("runtimes") ? "runtimes"
                    : pathname.includes("settings") ? "settings"
                        : "overview"

    return <Container>
        <Tab defaultValue={defaultValue}>
            <TabList>
                <TabTrigger value={"overview"}>
                    <Link href={baseLink}>
                        <Button variant={"none"}>
                            <IconHome size={16}/>
                            Overview
                        </Button>
                    </Link>
                </TabTrigger>
                <TabTrigger value={"projects"}>
                    <Link href={`${baseLink}/projects`}>
                        <Button variant={"none"}>
                            <IconFolders size={16}/>
                            Projects
                        </Button>
                    </Link>
                </TabTrigger>
                <TabTrigger value={"members"}>
                    <Link href={`${baseLink}/members`}>
                        <Button variant={"none"}>
                            <IconUsers size={16}/>
                            Members
                        </Button>
                    </Link>
                </TabTrigger>
                <TabTrigger value={"roles"}>
                    <Link href={`${baseLink}/roles`}>
                        <Button variant={"none"}>
                            <IconUserCog size={16}/>
                            Roles
                        </Button>
                    </Link>
                </TabTrigger>
                <TabTrigger value={"runtimes"}>
                    <Link href={`${baseLink}/runtimes`}>
                        <Button variant={"none"}>
                            <IconServer size={16}/>
                            Runtimes
                        </Button>
                    </Link>
                </TabTrigger>
                <TabTrigger value={"settings"}>
                    <Link href={`${baseLink}/settings`}>
                        <Button variant={"none"}>
                            <IconSettings size={16}/>
                            Settings
                        </Button>
                    </Link>
                </TabTrigger>
            </TabList>
        </Tab>
    </Container>
}