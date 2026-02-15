"use client"

import {
    AuroraBackground,
    Col,
    Container,
    ContextStoreProvider,
    DFullScreen,
    DUserView,
    Flex, Spacing,
    Text
} from "@code0-tech/pictor";
import {UserService} from "@edition/user/services/User.service";
import {useApolloClient} from "@apollo/client/react";
import {GraphqlClient} from "@core/util/graphql-client";
import Image from "next/image";
import React from "react";
import {usePersistentReactiveArrayService} from "@/hooks/usePersistentReactiveArrayService";

export default function AuthLayout({children}: Readonly<{ children: React.ReactNode }>) {

    const client = useApolloClient()
    const [store, service] = usePersistentReactiveArrayService<DUserView, UserService>("auth-users", (store) => new UserService(new GraphqlClient(client), store))

    return (
        <DFullScreen>
            <AuroraBackground/>
            <ContextStoreProvider services={[[store, service]]}>
                <Container h={"100%"} w={"100%"}>
                    <Flex h={"100%"} w={"100%"} align={"center"} justify={"center"}>
                        <Col xs={4}>
                            <Image src={"/CodeZero_Logo.png"} alt={"CodeZero Logo"}
                                   width={40}
                                   height={40}/>
                            <Spacing spacing={"xl"}/>
                            <Text style={{fontSize: "2rem", fontWeight: "600", lineHeight: "1"}}
                                  hierarchy={"primary"}
                                  display={"inline-block"}>
                                Every great idea starts at zero. {" "}
                                <Text style={{fontSize: "2rem", fontWeight: "600", lineHeight: "1"}}
                                      hierarchy={"tertiary"} display={"inline"}>
                                    Start with CodeZero.
                                </Text>
                            </Text>
                            <Spacing spacing={"xl"}/>
                            {children}
                        </Col>
                    </Flex>
                </Container>
            </ContextStoreProvider>
            <div style={{
                position: "absolute",
                width: "100%",
                boxSizing: "border-box",
                padding: "1.3rem",
                bottom: 0,
                left: 0
            }}>
                <Flex justify={"center"} align={"center"} w={"100%"} style={{gap: "1.3rem"}}>
                    <Text>All rights reserved &copy; Code0 UG (haftungsbeschränkt) i.G.</Text>
                </Flex>
            </div>

        </DFullScreen>
    );
}
