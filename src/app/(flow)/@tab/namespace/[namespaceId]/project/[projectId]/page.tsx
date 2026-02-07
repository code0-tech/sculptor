"use client"

import {Tab, TabList, TabTrigger} from "@code0-tech/pictor/dist/components/tab/Tab";
import {Button} from "@code0-tech/pictor";
import {IconBuilding, IconHome} from "@tabler/icons-react";
import React from "react";

export default function Page() {
    return <Tab defaultValue={"defaultValue"} orientation={"vertical"}>
        <TabList>
            <TabTrigger value={"overview"} asChild={true}>
                <Button variant={"none"} paddingSize={"xs"}>
                    <IconHome size={16}/>
                </Button>
            </TabTrigger>
            <TabTrigger value={"organizations"} asChild={true}>
                <Button variant={"none"} paddingSize={"xs"}>
                    <IconBuilding size={16}/>
                </Button>
            </TabTrigger>
        </TabList>
    </Tab>
}