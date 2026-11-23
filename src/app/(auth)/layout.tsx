"use client"

import {
    AuroraBackground,
    Col,
    Container,
    ContextStoreProvider,
    Flex,
    Icon,
    ScrollArea,
    ScrollAreaScrollbar,
    ScrollAreaThumb,
    ScrollAreaViewport,
    Spacing,
    Text
} from "@code0-tech/pictor";
import {UserService} from "@edition/user/services/User.service";
import {Application, ApplicationService} from "@edition/application/services/Application.service";
import {useApolloClient} from "@apollo/client/react";
import {GraphqlClient} from "@core/util/graphql-client";
import Link from "next/link";
import React from "react";
import {usePersistentReactiveArrayService} from "@/hooks/usePersistentReactiveArrayService";
import {FullScreen} from "@code0-tech/pictor/dist/components/fullscreen/FullScreen";
import {useUserSession} from "@edition/user/hooks/User.session.hook";
import {OrganizationView} from "@edition/organization/services/Organization.view";
import {OrganizationService} from "@edition/organization/services/Organization.service";
import {NamespaceService} from "@edition/namespace/services/Namespace.service";
import {Namespace, User} from "@code0-tech/sagittarius-graphql-types";

export default function AuthLayout({children}: Readonly<{ children: React.ReactNode }>) {

    const client = useApolloClient()
    const currentSession = useUserSession()
    const graphqlClient = React.useMemo(() => new GraphqlClient(client), [client])

    const [store, service] = usePersistentReactiveArrayService<User, UserService>("auth-users", (store) => new UserService(graphqlClient, store))
    const organization = usePersistentReactiveArrayService<OrganizationView, OrganizationService>(`dashboard::organizations::${currentSession?.id}`, (store) => new OrganizationService(graphqlClient, store))
    const [applicationStore, applicationService] = usePersistentReactiveArrayService<Application, ApplicationService>(`auth::application::${currentSession?.id}`, (store) => new ApplicationService(graphqlClient, store))
    const namespace = usePersistentReactiveArrayService<Namespace, NamespaceService>(`dashboard::namespaces::${currentSession?.id}`, (store) => new NamespaceService(graphqlClient, store))

    const legalUrls = React.useMemo(
        () => {
            const application = applicationService.get()
            return {
                privacyUrl: application?.privacyUrl,
                legalNoticeUrl: application?.legalNoticeUrl,
                termsAndConditionsUrl: application?.termsAndConditionsUrl
            }
        },
        [applicationStore]
    )

    return (
        <FullScreen bg={"var(--primary)"}>
            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: "scaleX(-1)",
                height: "50%",
                opacity: "0.25"
            }}>
                <div style={{
                    position: "absolute",
                    top: "0",
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "radial-gradient(circle at top right,rgba(25, 24, 37, 0) 0%, var(--primary) 35%)",
                    zIndex: "1",
                    WebkitBackdropFilter: "blur(5rem)",
                }}/>
                <AuroraBackground/>
            </div>

            <div style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "100%",
                transform: "",
                height: "100%",
                opacity: "0.25",
                filter: "blur(5rem)",
            }}>
                <AuroraBackground/>
            </div>
            <ScrollArea mah={"100%"} h={"100%"} style={{position: "relative", zIndex: 2}}>
                <ScrollAreaViewport>
                    <div style={{display: "flex", flexDirection: "column", minHeight: "100dvh"}}>
                        <ContextStoreProvider
                            services={[[store, service], organization, namespace, [applicationStore, applicationService]]}>
                            <Container w={"100%"} display={"flex"} justify={"center"} style={{flex: 1}}>
                                <Col xs={12} md={8} lg={6} xxl={4} py={5} style={{marginTop: "auto", marginBottom: "auto"}}>
                                    <Icon icon={"codezero:codezero"} color={"#fff"} size={40}/>
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
                            </Container>
                        </ContextStoreProvider>
                        <div style={{
                            position: "relative",
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "1.3rem",
                            zIndex: 2
                        }}>
                            <Flex justify={"center"} align={"center"} w={"100%"}
                                  style={{gap: "0.7rem 1.3rem", flexWrap: "wrap", textAlign: "center"}}>
                                <Text>All rights reserved &copy; Code0 UG (haftungsbeschränkt)</Text>
                                {!!legalUrls.privacyUrl && (
                                    <Link href={legalUrls.privacyUrl} target={"_blank"}>
                                        <Text>Privacy Policy</Text>
                                    </Link>
                                )}
                                {!!legalUrls.legalNoticeUrl && (
                                    <Link href={legalUrls.legalNoticeUrl} target={"_blank"}>
                                        <Text>Legal Notice</Text>
                                    </Link>
                                )}
                                {!!legalUrls.termsAndConditionsUrl && (
                                    <Link href={legalUrls.termsAndConditionsUrl} target={"_blank"}>
                                        <Text>Terms &amp; Conditions</Text>
                                    </Link>
                                )}
                            </Flex>
                        </div>
                    </div>
                </ScrollAreaViewport>
                <ScrollAreaScrollbar orientation={"vertical"}>
                    <ScrollAreaThumb/>
                </ScrollAreaScrollbar>
            </ScrollArea>

        </FullScreen>
    );
}
