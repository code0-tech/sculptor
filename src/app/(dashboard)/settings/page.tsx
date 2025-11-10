"use client"

import {Button, Card, DLayout, Flex, InputLabel, Spacing, SwitchInput, Text} from "@code0-tech/pictor";
import {Tab, TabContent, TabList, TabTrigger} from "@code0-tech/pictor/dist/components/tab/Tab";
import {IconBan} from "@tabler/icons-react";

export default function Page() {
    return <Tab orientation={"vertical"} defaultValue={"restrictions"}>
        <DLayout leftContent={
            <TabList>
                <InputLabel>General</InputLabel>
                <Spacing spacing={"xs"}/>
                <TabTrigger value={"restrictions"}>
                    <Button variant={"none"}>
                        <IconBan size={16}/>
                        Restrictions
                    </Button>
                </TabTrigger>
            </TabList>
        }>
            <TabContent value={"restrictions"}>
                <Text size={"xl"}>Restrictions</Text>
                <Spacing spacing={"xs"}/>
                <Flex style={{gap: "0.7rem", flexDirection: "column"}}>
                    <Card>
                        <SwitchInput title={"Organization creation"}
                                     description={"Set if organization creation is restricted to administrators."}/>
                    </Card>
                    <Card>
                        <SwitchInput title={"User registration"}
                                     description={"Set if user registration is enabled."}/>
                    </Card>
                </Flex>

            </TabContent>
        </DLayout>
    </Tab>
}
