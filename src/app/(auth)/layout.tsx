"use client"

import {
    AuroraBackground,
    Col,
    Container,
    ContextStoreProvider,
    Flex, Spacing,
    Text
} from "@code0-tech/pictor";
import {UserService} from "@edition/user/services/User.service";
import {useApolloClient} from "@apollo/client/react";
import {GraphqlClient} from "@core/util/graphql-client";
import Image from "next/image";
import React from "react";
import {usePersistentReactiveArrayService} from "@/hooks/usePersistentReactiveArrayService";
import {UserView} from "@edition/user/services/User.view";
import {FullScreen} from "@code0-tech/pictor/dist/components/fullscreen/FullScreen";
import {Namespace} from "@code0-tech/sagittarius-graphql-types";
import {NamespaceService} from "@edition/namespace/services/Namespace.service";
import {useUserSession} from "@edition/user/hooks/User.session.hook";
import {OrganizationView} from "@edition/organization/services/Organization.view";
import {OrganizationService} from "@edition/organization/services/Organization.service";

export default function AuthLayout({children}: Readonly<{ children: React.ReactNode }>) {

    const client = useApolloClient()
    const currentSession = useUserSession()
    const graphqlClient = React.useMemo(() => new GraphqlClient(client), [client])

    const [store, service] = usePersistentReactiveArrayService<UserView, UserService>("auth-users", (store) => new UserService(graphqlClient, store))
    const organization = usePersistentReactiveArrayService<OrganizationView, OrganizationService>(`dashboard::organizations::${currentSession?.id}`, (store) => new OrganizationService(graphqlClient, store))

    return (
        <FullScreen>
            <AuroraBackground/>
            <ContextStoreProvider services={[[store, service], organization]}>
                <Container h={"100%"} w={"100%"}>
                    <Flex h={"100%"} w={"100%"} align={"center"} justify={"center"}>
                        <Col xs={4}>
                            <Image src={"/CodeZero_Logo.png"} alt={"CodeZero Logo"}
                                   width={40}
                                   height={40}/>
                            <Spacing spacing={"xl"}/>
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
                    <Text>All rights reserved &copy; Code0 UG (haftungsbeschränkt)</Text>
                </Flex>
            </div>

        </FullScreen>
    );
}
