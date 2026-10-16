"use client"

import React from "react";
import "./ErrorCode.style.scss";
import {AuroraBackground, Button, Col, Container, Flex, getSize, Spacing, Text} from "@code0-tech/pictor";
import {FullScreen} from "@code0-tech/pictor/dist/components/fullscreen/FullScreen";
import {IconArrowLeft, IconHome} from "@tabler/icons-react";
import {getApolloContext} from "@apollo/client/react";
import {Application, ApplicationService} from "@edition/application/services/Application.service";
import {GraphqlClient} from "@core/util/graphql-client";
import {usePersistentReactiveArrayService} from "@/hooks/usePersistentReactiveArrayService";
import Link from "next/link";
import {useRouter} from "next/navigation";

export const NotFoundPage: React.FC = () => {

    const router = useRouter()

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
            <Col xs={4} py={5} style={{marginTop: "auto", marginBottom: "auto"}}
                 data-qa-selector={"not-found-page"}>
                <Text className={"error-code error-code--warning"} data-code={"404"} display={"block"}>404</Text>
                <Spacing spacing={"lg"}/>
                <Text style={{fontSize: "2rem", fontWeight: "600"}} hierarchy={"primary"} display={"inline"}>
                    This path leads nowhere. {" "}
                </Text>
                <Text style={{fontSize: "2rem", fontWeight: "600"}} hierarchy={"tertiary"} display={"inline"}>
                    Every other one still does.
                </Text>
                <Spacing spacing={"lg"}/>
                <Text size={"md"} hierarchy={"tertiary"} display={"block"}>
                    The page you requested was moved, renamed or never existed. It is also possible that your
                    account is missing the permission to see it. Check the address or continue from your dashboard.
                </Text>
                <Spacing spacing={"xl"}/>
                <Flex align={"center"} style={{gap: getSize("md")}}>
                    <Button color={"secondary"} w={"100%"} justify={"center"} onClick={() => router.back()}>
                        <IconArrowLeft size={16}/>
                        Go back
                    </Button>
                    <Link href={"/"} style={{width: "100%"}}>
                        <Button color={"success"} w={"100%"} justify={"center"}>
                            <IconHome size={16}/>
                            Back to dashboard
                        </Button>
                    </Link>
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
