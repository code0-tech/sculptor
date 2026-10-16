"use client"

import React from "react";
import "./ErrorCode.style.scss";
import {AuroraBackground, Button, Col, Container, Flex, getSize, Spacing, Text} from "@code0-tech/pictor";
import {FullScreen} from "@code0-tech/pictor/dist/components/fullscreen/FullScreen";
import {IconHome, IconRefresh} from "@tabler/icons-react";
import {getApolloContext} from "@apollo/client/react";
import {Application, ApplicationService} from "@edition/application/services/Application.service";
import {GraphqlClient} from "@core/util/graphql-client";
import {usePersistentReactiveArrayService} from "@/hooks/usePersistentReactiveArrayService";
import Link from "next/link";

export interface ErrorPageProps {
    error: Error & { digest?: string }
    retry: () => void
}

export const ErrorPage: React.FC<ErrorPageProps> = (props) => {

    const {error, retry} = props

    const apollo = React.useContext(getApolloContext())

    const [applicationStore, applicationService] = usePersistentReactiveArrayService<Application, ApplicationService>(
        "error::application",
        (store) => new ApplicationService(new GraphqlClient(apollo.client!), store)
    )

    const legalUrls = React.useMemo(() => {
        const application = !!apollo.client ? applicationService.get() : undefined
        return {
            privacyUrl: application?.privacyUrl,
            legalNoticeUrl: application?.legalNoticeUrl,
            termsAndConditionsUrl: application?.termsAndConditionsUrl
        }
    }, [applicationStore, apollo.client])

    const reference = React.useMemo(() => error.digest ?? error.message, [error])

    React.useEffect(() => {
        console.error("[ERROR]", error)
    }, [error])

    return <FullScreen bg={"var(--primary)"}>
        <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "50%",
            opacity: "0.25",
            transform: "scaleX(-1)"
        }}>
            <div style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(circle at top right, rgba(25, 24, 37, 0) 0%, var(--primary) 35%)",
                zIndex: 1,
                WebkitBackdropFilter: "blur(5rem)"
            }}/>
            <AuroraBackground/>
        </div>
        <Container h={"100%"} w={"100%"} display={"flex"} justify={"center"}
                   style={{position: "relative", zIndex: 2}}>
            <Col xs={4} py={5} style={{marginTop: "auto", marginBottom: "auto"}} data-qa-selector={"error-page"}>
                <Text className={"error-code error-code--error"} data-code={"500"} display={"block"}>500</Text>
                <Spacing spacing={"lg"}/>
                <Text style={{fontSize: "2rem", fontWeight: "600"}} hierarchy={"primary"} display={"inline"}>
                    Something broke on our side. {" "}
                </Text>
                <Text style={{fontSize: "2rem", fontWeight: "600"}} hierarchy={"tertiary"} display={"inline"}>
                    Your work is safe.
                </Text>
                <Spacing spacing={"lg"}/>
                <Text size={"md"} hierarchy={"tertiary"} display={"block"}>
                    This page could not be rendered. Trying again usually resolves it. If it keeps happening, share
                    this with your administrator: {" "}
                    <Text size={"md"} hierarchy={"secondary"} display={"inline"}
                          style={{wordBreak: "break-word", verticalAlign: "baseline"}}>
                        {reference}
                    </Text>
                </Text>
                <Spacing spacing={"xl"}/>
                <Flex align={"center"} style={{gap: getSize("md")}}>
                    <Link href={"/"} style={{width: "100%"}}>
                        <Button color={"secondary"} w={"100%"} justify={"center"}>
                            <IconHome size={16}/>
                            Back to dashboard
                        </Button>
                    </Link>
                    <Button color={"success"} w={"100%"} justify={"center"} onClick={retry}>
                        <IconRefresh size={16}/>
                        Try again
                    </Button>
                </Flex>
            </Col>
        </Container>
        <div style={{
            position: "absolute",
            width: "100%",
            boxSizing: "border-box",
            padding: "1.3rem",
            bottom: 0,
            left: 0,
            zIndex: 2
        }}>
            <Flex justify={"center"} align={"center"} w={"100%"} style={{gap: "1.3rem"}}>
                <Text>All rights reserved &copy; Code0 UG (haftungsbeschränkt)</Text>
                {!!legalUrls.privacyUrl && <Link href={legalUrls.privacyUrl} target={"_blank"}>
                    <Text>Privacy Policy</Text>
                </Link>}
                {!!legalUrls.legalNoticeUrl && <Link href={legalUrls.legalNoticeUrl} target={"_blank"}>
                    <Text>Legal Notice</Text>
                </Link>}
                {!!legalUrls.termsAndConditionsUrl && <Link href={legalUrls.termsAndConditionsUrl} target={"_blank"}>
                    <Text>Terms &amp; Conditions</Text>
                </Link>}
            </Flex>
        </div>
    </FullScreen>
}
