import React from "react";
import {TabTrigger} from "@code0-tech/pictor/dist/components/tab/Tab";
import {Button, Text} from "@code0-tech/pictor";
import {IconLicense} from "@tabler/icons-react";

export const NamespaceLicensesTabTriggerView: React.FC = () => {
    return <TabTrigger value={"licenses"} w={"100%"} asChild>
        <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
            <IconLicense size={13}/>
            <Text size={"md"}>Licenses</Text>
        </Button>
    </TabTrigger>
}
