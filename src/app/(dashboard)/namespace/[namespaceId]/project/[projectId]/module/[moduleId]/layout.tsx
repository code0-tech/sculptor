"use client"

import React from "react";
import {Col, Flex} from "@code0-tech/pictor";

export default function AuthLayout({children}: Readonly<{ children: React.ReactNode }>) {
    return <div style={{
        background: "#070514",
        height: "100%",
        padding: "2rem",
        borderTopLeftRadius: "1rem",
        borderTopRightRadius: "1rem"
    }}>
        <Flex h={"100%"} w={"100%"} justify={"center"}>
            <Col xs={4} h={"100%"} py={7.5}>
                {children}
            </Col>
        </Flex>
    </div>
}