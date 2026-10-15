"use client"

import React from "react";
import {Button, Card, Flex, getSize, Spacing, Text, useService, useStore} from "@code0-tech/pictor";
import CardSection from "@code0-tech/pictor/dist/components/card/CardSection";
import {formatDistanceToNow} from "date-fns";
import Link from "next/link";
import {Namespace} from "@code0-tech/sagittarius-graphql-types";
import {NamespaceService} from "@edition/namespace/services/Namespace.service";
import {OrganizationService} from "@edition/organization/services/Organization.service";
import {UserService} from "@edition/user/services/User.service";
import {useUserSession} from "@edition/user/hooks/User.session.hook";
import {getNamespaceName} from "@edition/namespace/util/Namespace.name.util";
import {isLicenseActive} from "@core/util/license";
import {LicensePlanBadgeComponent} from "@edition/license/components/LicensePlanBadgeComponent";

export const UserSubscriptionsView: React.FC = () => {

    const namespaceService = useService(NamespaceService)
    const namespaceStore = useStore(NamespaceService)
    const organizationService = useService(OrganizationService)
    const organizationStore = useStore(OrganizationService)
    const userService = useService(UserService)
    const userStore = useStore(UserService)

    const currentSession = useUserSession()

    const currentUser = React.useMemo(
        () => userService.getById(currentSession?.user?.id),
        [userStore, userService, currentSession?.user?.id]
    )

    const memberships = React.useMemo(
        () => currentUser?.namespaceMemberships?.nodes ?? [],
        [currentUser?.namespaceMemberships?.nodes]
    )

    const namespaces = React.useMemo(
        () => memberships
            .map(membership => namespaceService.getById(membership?.namespace?.id))
            .filter((namespace): namespace is Namespace => !!namespace),
        [memberships, namespaceStore]
    )

    const workspaces = React.useMemo(
        () => namespaces.map(namespace => ({
            namespace: namespace,
            name: getNamespaceName(namespace, organizationService, userService) ?? ""
        })),
        [namespaces, organizationStore, userStore]
    )

    return <>
        <Text size={"lg"} hierarchy={"primary"} display={"block"}>Subscriptions</Text>
        <Spacing spacing={"xs"}/>
        <Text size={"md"} hierarchy={"tertiary"}>
            Subscriptions belong to workspaces, not to your account. Open a workspace to see or change the plan
            everyone in it uses.
        </Text>
        <Spacing spacing={"md"}/>
        <Text size={"md"} hierarchy={"secondary"}>Your workspaces</Text>
        <Spacing spacing={"lg"}/>
        {workspaces.length <= 0 ? <Card color={"secondary"} variant={"outlined"}
                                        style={{border: "1px solid rgba(191, 191, 191, 0.1)", boxShadow: "none"}}>
            <CardSection border>
                <Text size={"md"} hierarchy={"tertiary"}>
                    You are not a member of any workspace yet.
                </Text>
            </CardSection>
        </Card> : <Card color={"secondary"}>
            {workspaces.map(({namespace, name}) => {
                const namespaceIndex = namespace.id?.match(/Namespace\/(\d+)$/)?.[1]
                const license = namespace.currentLicense
                const active = isLicenseActive(license)
                return <CardSection key={namespace.id} border>
                    <Flex justify={"space-between"} align={"center"} style={{gap: getSize("md")}}>
                        <Flex style={{gap: getSize("xxxs"), flexDirection: "column"}}>
                            <Flex align={"center"} style={{gap: getSize("xs")}}>
                                <Text size={"md"} hierarchy={"primary"}>{name}</Text>
                                <LicensePlanBadgeComponent license={license}/>
                            </Flex>
                            <Text size={"md"} hierarchy={"tertiary"}>
                                {active ? <>Active until <Text size={"md"} hierarchy={"primary"} display={"inline"}
                                                             style={{verticalAlign: "baseline"}}>
                                    {license?.endDate ? formatDistanceToNow(license.endDate, {addSuffix: true}) : "further notice"}
                                </Text>.</> : "No subscription connected yet. Executions and AI are capped."}
                            </Text>
                        </Flex>
                        <Flex align={"center"} style={{flexShrink: 0}}>
                            <Link href={`/namespace/${namespaceIndex}/settings?tab=subscriptions`} prefetch>
                                <Button color={"tertiary"} paddingSize={"xxs"}>
                                    Subscription
                                </Button>
                            </Link>
                        </Flex>
                    </Flex>
                </CardSection>
            })}
        </Card>}
    </>
}
