"use client"

import React from "react";
import {Badge, Button, useService, useStore} from "@code0-tech/pictor";
import {Tab, TabList, TabTrigger} from "@code0-tech/pictor/dist/components/tab/Tab";
import {IconFolders, IconHome, IconServer, IconSettings, IconUserCog, IconUsers} from "@tabler/icons-react";
import {useParams, usePathname, useRouter} from "next/navigation";
import {NamespaceService} from "@edition/namespace/services/Namespace.service";
import {OrganizationService} from "@edition/organization/services/Organization.service";
import {ProjectService} from "@edition/project/services/Project.service";
import {RoleService} from "@edition/role/services/Role.service";
import {MemberService} from "@edition/member/services/Member.service";
import {RuntimeService} from "@edition/runtime/services/Runtime.service";
import {hashToColor} from "@code0-tech/pictor/dist/components/d-flow/DFlow.util";

export const NamespaceTabView: React.FC = () => {

    const pathname = usePathname()
    const router = useRouter()
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
            <TabTrigger value={"settings"} asChild>
                <Button variant={"none"} paddingSize={"xs"} onClick={() => router.push(`${baseLink}/settings`)}>
                    <IconSettings color={hashToColor("settings")} size={16}/>
                </Button>
            </TabTrigger>
        ) : null
    }, [namespace, parentOrganization])

    return <Tab defaultValue={defaultValue} orientation={"vertical"}>
        <TabList>
            <TabTrigger value={"overview"} asChild>
                <Button variant={"none"} paddingSize={"xs"} onClick={() => router.push(baseLink)}>
                    <IconHome color={hashToColor("home")} size={16}/>
                </Button>
            </TabTrigger>
            <TabTrigger value={"projects"} asChild>
                <Button variant={"none"} paddingSize={"xs"} onClick={() => router.push(`${baseLink}/projects`)}>
                    <IconFolders size={16}/>
                </Button>
            </TabTrigger>
            <TabTrigger value={"members"} asChild>
                <Button variant={"none"} paddingSize={"xs"} onClick={() => router.push(`${baseLink}/members`)}>
                    <IconUsers size={16}/>
                </Button>
            </TabTrigger>
            <TabTrigger value={"roles"} asChild>
                <Button variant={"none"} paddingSize={"xs"} onClick={() => router.push(`${baseLink}/roles`)}>
                    <IconUserCog size={16}/>
                </Button>
            </TabTrigger>
            <TabTrigger value={"runtimes"} asChild>
                <Button variant={"none"} paddingSize={"xs"} onClick={() => router.push(`${baseLink}/runtimes`)}>
                    <IconServer size={16}/>
                </Button>
            </TabTrigger>
            {settings}
        </TabList>
    </Tab>
}