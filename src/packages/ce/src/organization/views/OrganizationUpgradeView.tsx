"use client"

import React from "react";
import {
    AuroraBackground,
    Badge,
    Button,
    Card,
    Col,
    Flex,
    Row,
    SegmentedControl,
    SegmentedControlItem,
    Spacing,
    Text
} from "@code0-tech/pictor";
import {IconArrowRight, IconBuilding, IconGitBranch, IconServer, IconUserCog} from "@tabler/icons-react";

export const OrganizationUpgradeView: React.FC = () => {

    const [value, setValue] = React.useState("annually")

    return <>
        <Text size={"xl"} hierarchy={"primary"}>Upgrade to Team</Text>
        <Spacing spacing={"xxs"}/>
        <Text size={"md"} hierarchy={"tertiary"}>
            Upgrade your organization to the Team plan to unlock advanced features, enhanced collaboration tools, and
            priority support. Elevate your team's productivity and take advantage of exclusive benefits designed to help
            your organization thrive.
        </Text>
        <Spacing spacing={"xl"}/>
        <Flex align={"center"} justify={"center"}>
            <SegmentedControl type={"single"} onValueChange={value => {
                if (value )setValue(value)
            }} value={value}>
                <SegmentedControlItem value={"monthly"}>
                    <Text size={"sm"} hierarchy={"secondary"}>Billed monthly</Text>
                </SegmentedControlItem>
                <SegmentedControlItem value={"annually"}>
                    <Flex align={"center"} style={{gap: "0.35rem"}}>
                        <Text size={"sm"} hierarchy={"secondary"}>Billed annually</Text>
                        <Badge color={"error"} border>
                            <Text size={"sm"} hierarchy={"tertiary"} style={{color: "inherit"}}>-27%</Text>
                        </Badge>
                    </Flex>
                </SegmentedControlItem>
            </SegmentedControl>
        </Flex>
        <Spacing spacing={"xl"}/>
        <Row>
            <Col lg={4}>
                <Card>
                    <Text size={"xl"} hierarchy={"tertiary"}>Team self-hosted</Text>
                    <Spacing spacing={"md"}/>
                    <Flex align={"center"} justify={"space-between"} style={{gap: "1.3rem"}}>
                        <Text size={"xl"} style={{fontSize: "2rem"}} hierarchy={"primary"}>7,95€</Text>
                        <Text size={"md"} hierarchy={"tertiary"} style={{textAlign: "right"}}>per member / month billed monthly</Text>
                    </Flex>
                    <Spacing spacing={"md"}/>
                    <Button w={"100%"} color={"secondary"}>Get started now</Button>
                    <Spacing spacing={"md"}/>
                    <Flex style={{gap: "0.7rem", flexDirection: "column"}}>
                        <Text size={"md"} display={"flex"} align={"center"} style={{gap: "0.7rem"}}>
                            <IconBuilding size={16}/>
                            Manage projects inside organizations
                        </Text>
                        <Text size={"md"} display={"flex"} align={"center"} style={{gap: "0.7rem"}}>
                            <IconUserCog size={16}/>
                            Advanced role management
                        </Text>
                        <Text size={"md"} display={"flex"} align={"center"} style={{gap: "0.7rem"}}>
                            <IconGitBranch size={16}/>
                            Unlimited flows
                        </Text>
                        <Text size={"md"} display={"flex"} align={"center"} style={{gap: "0.7rem"}}>
                            <IconServer size={16}/>
                            10.000 runtime minutes per month
                        </Text>
                        <Button paddingSize={"xxs"} color={"primary"}>
                            See all the features
                            <IconArrowRight size={16}/>
                        </Button>
                    </Flex>
                </Card>
            </Col>
            <Col lg={4}>
                <Card color={"secondary"}>
                    <Flex align={"center"} justify={"space-between"} style={{gap: "1.3rem"}}>
                        <Text size={"xl"} hierarchy={"tertiary"}>Team cloud</Text>
                    </Flex>
                    <Spacing spacing={"md"}/>
                    <Flex align={"center"} justify={"space-between"} style={{gap: "1.3rem"}}>
                        <div style={{position: "relative"}}>
                            <Text size={"xl"} style={{fontSize: "2rem"}} hierarchy={"primary"}>3,95€</Text>
                            <Badge pos={"absolute"}
                                   style={{top: 0, right: 0, transform: "translateX(90%) translateY(90%)"}}
                                   color={"error"} border>
                                <Text size={"sm"} hierarchy={"tertiary"} style={{color: "inherit"}}>-27%</Text>
                            </Badge>
                        </div>
                        <Text size={"md"} hierarchy={"tertiary"} style={{textAlign: "right"}}>per member / month
                            billed annually</Text>
                    </Flex>
                    <Spacing spacing={"md"}/>
                    <Button w={"100%"} color={"tertiary"}>Get started now</Button>
                    <Spacing spacing={"md"}/>
                    <Flex style={{gap: "0.7rem", flexDirection: "column"}}>
                        <Text size={"md"} display={"flex"} align={"center"} style={{gap: "0.7rem"}}>
                            <IconBuilding size={16}/>
                            Manage projects inside organizations
                        </Text>
                        <Text size={"md"} display={"flex"} align={"center"} style={{gap: "0.7rem"}}>
                            <IconUserCog size={16}/>
                            Advanced role management
                        </Text>
                        <Text size={"md"} display={"flex"} align={"center"} style={{gap: "0.7rem"}}>
                            <IconGitBranch size={16}/>
                            Unlimited flows
                        </Text>
                        <Text size={"md"} display={"flex"} align={"center"} style={{gap: "0.7rem"}}>
                            <IconServer size={16}/>
                            10.000 runtime minutes per month
                        </Text>
                        <Button paddingSize={"xxs"}>
                            See all the features
                            <IconArrowRight size={16}/>
                        </Button>
                    </Flex>
                    <AuroraBackground/>
                </Card>
            </Col>
            <Col lg={4}>
                <Card>
                    <Text size={"xl"} hierarchy={"tertiary"}>Team cloud (pay as you go)</Text>
                    <Spacing spacing={"md"}/>
                    <Flex align={"center"} justify={"space-between"} style={{gap: "1.3rem"}}>
                        <Text size={"xl"} style={{fontSize: "2rem"}} hierarchy={"primary"}>3,95€</Text>
                        <Text size={"md"} hierarchy={"tertiary"} style={{textAlign: "right"}}>per member / month billed monthly</Text>
                    </Flex>
                    <Spacing spacing={"md"}/>
                    <Button w={"100%"} color={"secondary"}>Get started now</Button>
                    <Spacing spacing={"md"}/>
                    <Flex style={{gap: "0.7rem", flexDirection: "column"}}>
                        <Text size={"md"} display={"flex"} align={"center"} style={{gap: "0.7rem"}}>
                            <IconBuilding size={16}/>
                            Manage projects inside organizations
                        </Text>
                        <Text size={"md"} display={"flex"} align={"center"} style={{gap: "0.7rem"}}>
                            <IconUserCog size={16}/>
                            Advanced role management
                        </Text>
                        <Text size={"md"} display={"flex"} align={"center"} style={{gap: "0.7rem"}}>
                            <IconGitBranch size={16}/>
                            Unlimited flows
                        </Text>
                        <Text size={"md"} display={"flex"} align={"center"} style={{gap: "0.7rem"}}>
                            <IconServer size={16}/>
                            10.000 runtime minutes per month
                        </Text>
                        <Button paddingSize={"xxs"} color={"primary"}>
                            See all the features
                            <IconArrowRight size={16}/>
                        </Button>
                    </Flex>
                </Card>
            </Col>
        </Row>
    </>
}