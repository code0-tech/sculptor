"use client"

import {Button, Flex, Text} from "@code0-tech/pictor";
import {IconChevronDown, IconPlus} from "@tabler/icons-react";
import React from "react";

const Page = () => {

    return <Flex style={{flexDirection: "column", gap: "1.3rem"}}>
        <Flex justify={"space-between"} align={"center"}>
            <Text size={"xl"} hierarchy={"primary"}>
                All organizations
            </Text>
            <Flex style={{gap: ".7rem"}} align={"center"}>
                <Button>
                    Sort
                    <IconChevronDown size={16}/>
                </Button>
                <Button color={"success"}>
                    Create organization
                    <IconPlus size={16}/>
                </Button>
            </Flex>
        </Flex>
    </Flex>
}

export default React.memo(Page);
