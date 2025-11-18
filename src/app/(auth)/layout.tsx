"use client"

import {
    Col,
    Container,
    ContextStoreProvider,
    DFullScreen,
    DUserView,
    Flex,
    Text
} from "@code0-tech/pictor";
import {UserService} from "@edition/user/User.service";
import {useApolloClient} from "@apollo/client/react";
import {GraphqlClient} from "@core/util/graphql-client";
import Image from "next/image";
import React from "react";
import {usePersistentReactiveArrayService} from "@/hooks/usePersistentReactiveArrayService";

export default function AuthLayout({children}: Readonly<{ children: React.ReactNode }>) {

    const client = useApolloClient()
    const [store, service] = usePersistentReactiveArrayService<DUserView, UserService>(
        "auth-users",
        (store) => new UserService(new GraphqlClient(client), store)
    )

    return (
        <DFullScreen>
            <div style={{
                backgroundImage: "url(/CodeZero_Rainbow.png)",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center bottom",
                width: "100%",
                height: "100%",
            }}>
                <ContextStoreProvider services={[[store, service]]}>
                    <Container h={"100%"} w={"100%"}>
                        <Flex h={"100%"} w={"100%"} align={"center"} justify={"center"}>
                            <Col xs={4}>
                                {children}
                            </Col>
                        </Flex>
                    </Container>
                </ContextStoreProvider>
                <div style={{
                    position: "fixed",
                    bottom: "1.3rem",
                    right: "1.3rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "1.3rem"
                }}>
                    <Text>All rights reserved &copy; Code0 UG (haftungsbeschränkt)</Text>
                    <Image src={"/CodeZero_Banner_Transparent.png"} alt={"CodeZero Banner"} width={150} height={0}
                           style={{width: '150px', height: 'auto'}}/>
                </div>
            </div>
        </DFullScreen>
    );
}
