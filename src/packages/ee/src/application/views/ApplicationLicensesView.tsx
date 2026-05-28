import React from "react";
import {
    AuroraBackground,
    Badge,
    Button,
    ButtonGroup,
    Card,
    Col,
    Flex,
    Progress,
    Row,
    Spacing,
    Text
} from "@code0-tech/pictor";
import Link from "next/link";
import {ApplicationLicensesDataTableComponent} from "@ee-internal/application/components/ApplicationLicensesDataTableComponent";
import {TabContent} from "@code0-tech/pictor/dist/components/tab/Tab";

export const ApplicationLicensesView: React.FC = () => {
    return <TabContent value={"license"}>
        <Flex align={"center"} justify={"space-between"}>
            <Flex style={{gap: "0.35rem", flexDirection: "column"}}>
                <Text size={"xl"} hierarchy={"primary"}>
                    Licenses
                </Text>
                <Text size={"sm"} hierarchy={"tertiary"}>
                    Manage members that belong to this namespace. You can add new members and manage their permissions.
                </Text>
            </Flex>
            <ButtonGroup>
                <Link href={"/licenses/add"}>
                    <Button color={"secondary"} variant={"none"}>
                        Add new license
                    </Button>
                </Link>
                <Link href={"https://codezero.build/subscription"}>
                    <Button color={"secondary"} variant={"none"}>
                        <AuroraBackground/>
                        Buy new license
                    </Button>
                </Link>
            </ButtonGroup>
        </Flex>
        <Spacing spacing={"xl"}/>
        <Row>
            <Col xs={4}>
                <Card color={"secondary"} h={"100%"}>
                    <Flex align={"center"} justify={"space-between"} style={{gap: "0.35rem"}}>
                        <Text hierarchy={"primary"}>
                            Enterprise Edition license
                        </Text>
                        <Badge color={"success"}>
                            <Text style={{color: "inherit"}}>
                                Active
                            </Text>
                        </Badge>
                    </Flex>
                    <Spacing spacing={"xs"}/>
                    <Card color={"primary"} mx={-1.2} mb={-1.2}>
                        <Text>
                            Active since
                            about 2 months ago
                            and active until
                            in 10 months
                        </Text>
                    </Card>
                </Card>
            </Col>
            <Col xs={4}>
                <Card color={"secondary"} h={"100%"}>
                    <Text hierarchy={"primary"}>
                        Workflow usage (2.250)
                    </Text>
                    <Spacing spacing={"xs"}/>
                    <Card color={"primary"} mx={-1.2} mb={-1.2}>
                        <Progress value={9} predictionValue={24} max={100}
                                  color={"linear-gradient(to right, #29BF12 0%, #D90429 100%)"}/>
                        <Spacing spacing={"xs"}/>
                        <Text>
                            You used 9% of your available workflow executions and will used 24% until its reseted.
                        </Text>
                    </Card>
                </Card>
            </Col>
            <Col xs={4}>
                <Card color={"secondary"} h={"100%"}>
                    <Text hierarchy={"primary"}>
                        AI usage (250)
                    </Text>
                    <Spacing spacing={"xs"}/>
                    <Card color={"primary"} mx={-1.2} mb={-1.2}>
                        <Progress value={50} predictionValue={89} max={100} color={"#70ffb2"}/>
                        <Spacing spacing={"xs"}/>
                        <Text>
                            You used 50% of your available workflow executions and will used 89% until its reseted.
                        </Text>
                    </Card>
                </Card>
            </Col>
        </Row>
        <Spacing spacing={"xl"}/>
        <Card color={"secondary"}>
            <Text hierarchy={"primary"}>
                All used or future licenses
            </Text>
            <Spacing spacing={"xs"}/>
            <Card color={"primary"} mx={-1.2} mb={-1.2}>
                <ApplicationLicensesDataTableComponent/>
            </Card>
        </Card>
    </TabContent>
}