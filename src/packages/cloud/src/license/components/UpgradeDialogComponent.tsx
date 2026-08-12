"use client"

import React from "react";
import {
    Card,
    Col,
    Dialog,
    DialogContent,
    DialogOverlay,
    DialogPortal,
    Flex,
    Row,
    Spacing,
    Text
} from "@code0-tech/pictor";
import {IconAdjustmentsHorizontal, IconArrowRight, IconBolt, IconHeadset, IconSparkles} from "@tabler/icons-react";
import BorderBeam from "border-beam";
import {UpgradeButtonComponent} from "@cloud-internal/license/components/UpgradeButtonComponent";

export interface UpgradeDialogComponentProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

const benefits = [
    {
        icon: IconBolt,
        title: "Up to 10k executions",
        text: "Run your flows without hitting the free-tier cap.",
    },
    {
        icon: IconSparkles,
        title: "Up to 4mio AI tokens",
        text: "Higher token limits for AI actions across the whole workspace.",
    },
    {
        icon: IconAdjustmentsHorizontal,
        title: "Limits that fit you",
        text: "Scale executions and AI as you grow. Pro, Max or fully custom.",
    },
    {
        icon: IconHeadset,
        title: "Priority support",
        text: "Get faster help from our team when it matters most.",
    },
]

export const UpgradeDialogComponent: React.FC<UpgradeDialogComponentProps> = ({open, onOpenChange}) => {

    return <Dialog open={open} onOpenChange={(open) => onOpenChange?.(open)}>
        <DialogPortal>
            <DialogOverlay/>
            <DialogContent w={"480px"}>
                <Card color={"primary"} style={{textAlign: "center", borderRadius: "calc(0.9rem)"}} mx={-0.9} mt={-0.9}>
                    <Flex align={"center"} justify={"center"} style={{gap: "0.7rem"}}>
                        <BorderBeam style={{display: "inline-block", transform: "rotate(-10deg)"}} strength={1}
                                    colorVariant={"mono"} size={"sm"} theme={"dark"} duration={5}>
                            <Card w={"50px"} h={"50px"} display={"flex"}
                                  align={"center"} justify={"center"}>
                                <Text style={{fontWeight: "bold"}}>
                                    PRO
                                </Text>
                            </Card>
                        </BorderBeam>
                        <Text>or</Text>
                        <BorderBeam style={{display: "inline-block", transform: "rotate(10deg)"}} strength={1}
                                    colorVariant={"sunset"} size={"sm"} theme={"dark"} duration={5}>
                            <Card w={"50px"} h={"50px"} display={"flex"}
                                  align={"center"} justify={"center"}>
                                <Text style={{fontWeight: "bold"}}>
                                    MAX
                                </Text>
                            </Card>
                        </BorderBeam>
                    </Flex>
                    <Spacing spacing={"xl"}/>
                    <Text size={"xl"} hierarchy={"primary"}>Upgrade your workspace</Text>
                    <Spacing spacing={"xs"}/>
                    <Text size={"sm"} hierarchy={"tertiary"}>
                        Unlock higher limits for executions and AI usage.
                        <br/>
                        Pick the plan that fits. Pro, Max or fully custom.
                    </Text>
                </Card>
                <Spacing mb={2.6} spacing={"xl"}/>
                <Row>
                    {benefits.map(benefit => {
                        const Icon = benefit.icon
                        return <Col xs={6} mb={1.3}>
                            <Flex key={benefit.title} style={{gap: "0.7rem"}}>
                                <Icon size={16} style={{minWidth: "16px", minHeight: "16px"}}/>
                                <Flex style={{flexDirection: "column", gap: "0.35rem", minWidth: 0}}>
                                    <Text size={"md"} hierarchy={"primary"} fw={500}>{benefit.title}</Text>
                                    <Text size={"sm"} hierarchy={"tertiary"}>{benefit.text}</Text>
                                </Flex>
                            </Flex>
                        </Col>
                    })}
                </Row>
                <Spacing spacing={"xl"}/>
                <Flex justify={"space-between"} align={"baseline"}>
                    <Text>
                        Full access starts at
                    </Text>
                    <Flex style={{gap: "0.35rem", alignItems: "baseline"}}>
                        <Text fz={1.6} hierarchy={"primary"}>
                            8,95€
                        </Text>
                        <Text hierarchy={"tertiary"}>
                            /per month
                        </Text>
                    </Flex>
                </Flex>
                <Spacing spacing={"xs"}/>
                <UpgradeButtonComponent beamSize={"line"} fullWidth>
                    Choose your plan
                    <IconArrowRight size={16}/>
                </UpgradeButtonComponent>
            </DialogContent>
        </DialogPortal>
    </Dialog>
}
