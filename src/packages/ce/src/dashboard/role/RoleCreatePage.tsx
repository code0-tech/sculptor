"use client"

import React from "react";
import {Button, Col, Flex, Spacing, Text, TextInput} from "@code0-tech/pictor";
import Link from "next/link";

export const RoleCreatePage: React.FC = () => {
    return <Flex mih={"100%"} miw={"100%"} align={"center"} justify={"center"}>
        <Col xs={4}>
            <Text size={"xl"} hierarchy={"primary"} display={"block"}>
                Create new role
            </Text>
            <Spacing spacing={"xs"}/>
            <Text size={"md"} hierarchy={"tertiary"} display={"block"}>
                Global runtimes are shared runtimes that can be used across multiple organizations.
            </Text>
            <Spacing spacing={"xl"}/>
            <TextInput required
                       title={"Name"}
                       description={"Provide a simple role name"}
                       />
            <Spacing spacing={"xl"}/>
            <Flex style={{gap: "0.35rem"}} justify={"space-between"}>
                <Link href={"/"}>
                    <Button color={"primary"}>
                        Go back to roles
                    </Button>
                </Link>
                <Button color={"success"} >
                    Create role
                </Button>
            </Flex>
        </Col>
    </Flex>
}