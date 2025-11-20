import React from "react";
import {Button, DOrganizationList, DRuntimeList, Flex, Spacing, Text, TextInput} from "@code0-tech/pictor";
import {IconSearch} from "@tabler/icons-react";
import Link from "next/link";

export const ApplicationRuntimePage: React.FC = () => {
    return <>
        <Flex align={"center"} justify={"space-between"}>
            <Text size={"xl"} hierarchy={"primary"}>
                Global runtimes
            </Text>
            <Flex align={"center"} style={{gap: "0.7rem"}}>
                <TextInput left={<IconSearch size={16}/>} placeholder={"Find a global runtime..."}/>
                <Link href={"/organizations/create"}>
                    <Button color={"success"}>Add Runtime</Button>
                </Link>
            </Flex>
        </Flex>
        <Spacing spacing={"xl"}/>
        <DRuntimeList/>
    </>
}