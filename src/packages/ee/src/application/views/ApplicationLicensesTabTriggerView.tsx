import React from "react";
import {Button, Text} from "@code0-tech/pictor";
import {TabTrigger} from "@code0-tech/pictor/dist/components/tab/Tab";
import {IconLicense} from "@tabler/icons-react";

export const ApplicationLicensesTabTriggerView: React.FC = () => {
    return <TabTrigger value={"license"} w={"100%"} asChild>
        <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
            <IconLicense size={13}/>
            <Text size={"md"}>Licenses</Text>
        </Button>
    </TabTrigger>
}
