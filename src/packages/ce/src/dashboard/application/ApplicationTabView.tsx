"use client"

import React from "react";
import {Tab, TabList, TabTrigger} from "@code0-tech/pictor/dist/components/tab/Tab";
import {Button, Container} from "@code0-tech/pictor";
import {IconBuilding, IconHome, IconSettings, IconUser} from "@tabler/icons-react";
import {usePathname} from "next/navigation";
import Link from "next/link";

export const ApplicationTabView: React.FC = () => {

    const pathname = usePathname()

    const defaultValue = pathname.includes("organizations") ? "organizations"
        : pathname.includes("users") ? "users"
            : pathname.includes("settings") ? "settings"
                : "overview"

    return <div style={{background: "rgba(255,2552,255,.1)", borderBottom: "1px solid rgba(255,2552,255,.1)"}}>
        <Container>
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
                            </Button>
                        </Link>
                    </TabTrigger>
                    <TabTrigger value={"users"}>
                        <Link href={"/users"}>
                            <Button variant={"none"}>
                                <IconUser size={16}/>
                                Users
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
                </TabList>
            </Tab>
        </Container>
    </div>
}