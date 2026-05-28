import React from "react";
import {TabList, TabTrigger} from "@code0-tech/pictor/dist/components/tab/Tab";
import {Button, Text} from "@code0-tech/pictor";

export const ApplicationTabListView: React.FC = () => {
    return <TabList>
        <TabTrigger value={"general"} w={"100%"} asChild>
            <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                <Text size={"md"}>General</Text>
            </Button>
        </TabTrigger>
        <TabTrigger value={"restrictions"} w={"100%"} asChild>
            <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                <Text size={"md"}>Restrictions</Text>
            </Button>
        </TabTrigger>
        <TabTrigger value={"license"} w={"100%"} asChild>
            <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                <Text size={"md"}>License</Text>
            </Button>
        </TabTrigger>
    </TabList>
}