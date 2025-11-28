"use client"

import React from "react";
import {Badge, Button, Container, useService, useStore} from "@code0-tech/pictor";
import {Tab, TabList, TabTrigger} from "@code0-tech/pictor/dist/components/tab/Tab";
import {IconFolders, IconHome, IconServer, IconSettings, IconUserCog, IconUsers} from "@tabler/icons-react";
import Link from "next/link";
import {useParams, usePathname} from "next/navigation";
import {NamespaceService} from "@edition/namespace/Namespace.service";
import {OrganizationService} from "@edition/organization/Organization.service";
import {ProjectService} from "@edition/project/Project.service";
import {RoleService} from "@edition/role/Role.service";
import {MemberService} from "@edition/member/Member.service";
import {RuntimeService} from "@edition/runtime/Runtime.service";

export const NamespaceTabView: React.FC = () => {

    const pathname = usePathname()
    const params = useParams()
    const namespaceId = params.namespaceId as any

    const namespaceService = useService(NamespaceService)
    const namespaceStore = useStore(NamespaceService)
    const organizationService = useService(OrganizationService)
    const organizationStore = useStore(OrganizationService)
    const projectService = useService(ProjectService)
    const roleService = useService(RoleService)
    const memberService = useService(MemberService)
    const runtimeService = useService(RuntimeService)
    const runtimeStore = useStore(RuntimeService)

    const namespace = React.useMemo(() => namespaceService.getById(`gid://sagittarius/Namespace/${namespaceId}`), [namespaceStore, namespaceId])
    const parentOrganization = React.useMemo(() => namespace?.parent?.__typename === "Organization" ? organizationService.getById(namespace?.parent?.id) : null, [organizationStore, namespace])

    const baseLink = `/namespace/${namespaceId}`
    const defaultValue = pathname.includes("projects") ? "projects"
        : pathname.includes("members") ? "members"
            : pathname.includes("roles") ? "roles"
                : pathname.includes("runtimes") ? "runtimes"
                    : pathname.includes("settings") ? "settings"
                        : "overview"

    const settings = React.useMemo(() => {
        return namespace?.parent?.__typename == "Organization"
        && parentOrganization
        && (
            parentOrganization.userAbilities?.deleteOrganization
            || parentOrganization?.userAbilities?.updateOrganization
            //TODO add license check for enterprise features
        ) ? (
            <TabTrigger value={"settings"}>
                <Link href={`${baseLink}/settings`}>
                    <Button variant={"none"}>
                        <IconSettings size={16}/>
                        Settings
                    </Button>
                </Link>
            </TabTrigger>
        ) : null
    }, [namespace, parentOrganization])

    return <Container>
        <Tab defaultValue={defaultValue}>
            <TabList>
                <TabTrigger value={"overview"}>
                    <Link href={baseLink}>
                        <Button variant={"none"}>
                            <IconHome size={16}/>
                            Overview
                        </Button>
                    </Link>
                </TabTrigger>
                <TabTrigger value={"projects"}>
                    <Link href={`${baseLink}/projects`}>
                        <Button variant={"none"}>
                            <IconFolders size={16}/>
                            Projects
                            <Badge>{projectService.values({namespaceId: `gid://sagittarius/Namespace/${namespaceId}`}).length}</Badge>
                        </Button>
                    </Link>
                </TabTrigger>
                <TabTrigger value={"members"}>
                    <Link href={`${baseLink}/members`}>
                        <Button variant={"none"}>
                            <IconUsers size={16}/>
                            Members
                            <Badge>{memberService.values({namespaceId: `gid://sagittarius/Namespace/${namespaceId}`}).length}</Badge>
                        </Button>
                    </Link>
                </TabTrigger>
                <TabTrigger value={"roles"}>
                    <Link href={`${baseLink}/roles`}>
                        <Button variant={"none"}>
                            <IconUserCog size={16}/>
                            Roles
                            <Badge>{roleService.values({namespaceId: `gid://sagittarius/Namespace/${namespaceId}`}).length}</Badge>
                        </Button>
                    </Link>
                </TabTrigger>
                <TabTrigger value={"runtimes"}>
                    <Link href={`${baseLink}/runtimes`}>
                        <Button variant={"none"}>
                            <IconServer size={16}/>
                            Runtimes
                            {React.useMemo(() => {
                                return <Badge>{runtimeService.values({namespaceId: `gid://sagittarius/Namespace/${namespaceId}`}).length}</Badge>
                            }, [runtimeStore, namespaceId])}
                        </Button>
                    </Link>
                </TabTrigger>
                {settings}
            </TabList>
        </Tab>
    </Container>
}