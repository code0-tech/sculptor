"use client"

import React from "react";
import {Col, Flex, Spacing, Text} from "@code0-tech/pictor";

export default function LicenseAddLayout({children}: Readonly<{ children: React.ReactNode }>) {
    return <Flex h={"100%"} w={"100%"} align={"center"} justify={"center"}>
        <Col xs={4} style={{marginTop: "auto", marginBottom: "auto"}}>
            <Text style={{fontSize: "2rem", fontWeight: "600"}}
                  hierarchy={"primary"}
                  display={"inline"}>
                Every great idea starts at zero. {" "}
            </Text>
            <Text style={{fontSize: "2rem", fontWeight: "600"}}
                  hierarchy={"tertiary"} display={"inline"}>
                Start with CodeZero.
            </Text>
            <Spacing spacing={"xl"}/>
            {children}
        </Col>
    </Flex>
}