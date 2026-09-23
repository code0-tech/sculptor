"use client"

import React from "react";
import {
    Button,
    Card,
    Col,
    Dialog,
    DialogContent,
    DialogOverlay,
    DialogPortal,
    Flex,
    Row,
    Spacing,
    Text,
    useService,
    useStore
} from "@code0-tech/pictor";
import {IconAdjustmentsHorizontal, IconArrowRight, IconBolt, IconHeadset, IconSparkles} from "@tabler/icons-react";
import BorderBeam from "border-beam";
import {useSearchParams} from "next/navigation";
import {Namespace} from "@code0-tech/sagittarius-graphql-types";
import {NamespaceService} from "@cloud-internal/namespace/services/Namespace.service";
import {OrganizationService} from "@edition/organization/services/Organization.service";
import {UserService} from "@edition/user/services/User.service";
import {getNamespaceName} from "@edition/namespace/util/Namespace.name.util";

const benefits = [
    {
        icon: IconBolt,
        title: "Up to 10k executions",
        text: "Run your flows without hitting the execution cap of this workspace.",
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

export interface UpgradeDialogComponentProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export const UpgradeDialogComponent: React.FC<UpgradeDialogComponentProps> = ({open, onOpenChange}) => {

    const searchParams = useSearchParams()
    const namespaceService = useService(NamespaceService)
    const namespaceStore = useStore(NamespaceService)
    const organizationService = useService(OrganizationService)
    const userService = useService(UserService)
    const [pending, startTransition] = React.useTransition()

    const namespaceIndex = searchParams.get("namespace") as any as number
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex}`

    const namespace = React.useMemo(
        () => namespaceIndex ? namespaceService.getById(namespaceId) : undefined,
        [namespaceStore, namespaceIndex, namespaceId]
    )

    const openSubscription = () => {
        const target = window.open("about:blank", "_blank")
        startTransition(async () => {
            const [config, tokenPayload] = await Promise.all([
                fetch("/api/config").then(response => response.json()),
                userService.usersCreateCraterToken()
            ])
            const subscriptionUrl = config?.subscriptionUrl as string | null | undefined
            const token = tokenPayload?.token?.token
            if (!subscriptionUrl || !token) {
                target?.close()
                return
            }
            const url = new URL(subscriptionUrl)
            if (namespaceIndex) url.searchParams.set("namespace", namespaceIndex.toString())
            url.searchParams.set("token", token)
            if (target) target.location.href = url.toString()
        })
    }

    const name = namespace ? getNamespaceName(namespace, organizationService, userService) : undefined
    const subject = namespace?.parent?.__typename === "Organization"
        ? (name ? `the ${name} workspace` : "your workspace")
        : name ?? "your workspace"

    return <Dialog open={open} onOpenChange={onOpenChange}>
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
                    <Text size={"xl"} hierarchy={"primary"}>
                        {`Upgrade ${subject}`}
                    </Text>
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
                        return <Col key={benefit.title} xs={6} mb={1.3}>
                            <Flex style={{gap: "0.7rem"}}>
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
                <BorderBeam strength={1} size={"line"} theme={"dark"} duration={5} style={{display: "block"}}>
                    <Button color={"tertiary"} paddingSize={"xxs"} disabled={pending}
                            onClick={openSubscription} justify={"center"} w={"100%"}>
                        Choose your plan
                        <IconArrowRight size={16}/>
                    </Button>
                </BorderBeam>
            </DialogContent>
        </DialogPortal>
    </Dialog>
}
