"use client"

import React from "react";
import {useParams} from "next/navigation";
import {Namespace} from "@code0-tech/sagittarius-graphql-types";
import {
    AuroraBackground,
    Avatar,
    Badge,
    Button,
    DLayout,
    Flex,
    Spacing,
    Text,
    useService,
    useStore
} from "@code0-tech/pictor";
import {NamespaceService} from "@edition/namespace/Namespace.service";
import {OrganizationService} from "@edition/organization/Organization.service";
import {IconFolders, IconServer, IconUserCog, IconUsers} from "@tabler/icons-react";
import {Tab, TabContent, TabList, TabTrigger} from "@code0-tech/pictor/dist/components/tab/Tab";
import {UsageView} from "@edition/dashboard/usage/UsageView";
import {OrganizationUpgradeView} from "@edition/dashboard/organization/OrganizationUpgradeView";
import {OrganizationDeleteView} from "@edition/dashboard/organization/OrganizationDeleteView";

export const OrganizationSettingsPage: React.FC = () => {

    const params = useParams()
    const namespaceService = useService(NamespaceService)
    const namespaceStore = useStore(NamespaceService)
    const organizationService = useService(OrganizationService)
    const organizationStore = useStore(OrganizationService)
    const [, startTransition] = React.useTransition()

    const namespaceIndex = params.namespaceId as any as number
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex}`
    const namespace = React.useMemo(() => namespaceService.getById(namespaceId), [namespaceStore, namespaceId])
    const parentOrganization = React.useMemo(() => namespace?.parent?.__typename === "Organization" ? organizationService.getById(namespace?.parent?.id) : null, [organizationStore, namespace])

    return <>
        <Spacing spacing={"xl"}/>
        <Flex style={{gap: "0.7rem"}} align={"center"}>
            <Avatar w={"60px"} bg={"transparent"} identifier={parentOrganization?.name!!}/>
            <Flex style={{gap: "0.35rem", flexDirection: "column"}}>
                <Text size={"xl"} hierarchy={"primary"} display={"block"}>
                    {parentOrganization?.name}
                </Text>
                <Flex style={{gap: "0.35rem"}} align={"center"}>
                    <Badge color={"secondary"} border>
                        <IconUsers size={16}/>
                        {namespace?.members?.count}
                    </Badge>
                    <Badge color={"secondary"} border>
                        <IconFolders size={16}/>
                        {namespace?.projects?.count}
                    </Badge>
                    <Badge color={"secondary"} border>
                        <IconUserCog size={16}/>
                        {namespace?.roles?.count}
                    </Badge>
                    <Badge color={"secondary"} border>
                        <IconServer size={16}/>
                        {namespace?.runtimes?.count}
                    </Badge>
                </Flex>
            </Flex>
        </Flex>
        <Spacing spacing={"xl"}/>
        <Tab orientation={"vertical"} defaultValue={"general"}>
            <DLayout leftContent={
                <TabList>
                    <TabTrigger value={"general"} asChild>
                        <Button paddingSize={"xxs"} variant={"none"}>
                            <Text size={"md"} hierarchy={"primary"}>General adjustments</Text>
                        </Button>
                    </TabTrigger>
                    <TabTrigger value={"upgrade"} asChild>
                        <Button color={"primary"} paddingSize={"xxs"} variant={"none"}>
                            <Text size={"md"} hierarchy={"primary"} display={"flex"} align={"center"}
                                  style={{gap: "0.35rem"}}>Upgrade to <Badge color={"info"}>Team</Badge></Text>
                            <AuroraBackground/>
                        </Button>
                    </TabTrigger>
                    <TabTrigger disabled value={"usage"} asChild>
                        <Button paddingSize={"xxs"} variant={"none"}>
                            <Text size={"md"} hierarchy={"primary"}>Runtime usage</Text>
                        </Button>
                    </TabTrigger>
                    <TabTrigger value={"delete"} asChild>
                        <Button color={"error"} paddingSize={"xxs"} variant={"none"}>
                            <Text size={"md"} hierarchy={"primary"}>Delete organization forever</Text>
                        </Button>
                    </TabTrigger>
                </TabList>
            }>
                <>
                    <TabContent value={"general"}>
                        <OrganizationDeleteView/>
                    </TabContent>
                    <TabContent value={"upgrade"}>
                        <OrganizationUpgradeView/>
                    </TabContent>
                    <TabContent value={"usage"}>
                        <UsageView/>
                    </TabContent>
                    <TabContent value={"delete"}>
                        <OrganizationDeleteView/>
                    </TabContent>
                </>
            </DLayout>
        </Tab>
    </>
}