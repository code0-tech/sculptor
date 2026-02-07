"use client"

import React from "react";
import {Badge, Breadcrumb, Text, useService, useStore} from "@code0-tech/pictor";
import {useParams, usePathname, useRouter} from "next/navigation";
import type {Namespace, NamespaceProject, NamespaceRole, Runtime, User} from "@code0-tech/sagittarius-graphql-types";
import {NamespaceService} from "@edition/namespace/Namespace.service";
import {RuntimeService} from "@edition/runtime/Runtime.service";
import {UserService} from "@edition/user/User.service";
import {ProjectService} from "@edition/project/Project.service";
import {RoleService} from "@edition/role/Role.service";
import {OrganizationService} from "@edition/organization/Organization.service";

export const ApplicationBreadcrumbView: React.FC = () => {

    const path = usePathname()
    const router = useRouter()
    const params = useParams()

    const namespaceIndex = params.namespaceId as string | undefined
    const runtimeIndex = params.runtimeId as string | undefined
    const userIndex = params.userId as string | undefined
    const projectIndex = params.projectId as string | undefined
    const roleIndex = params.roleId as string | undefined

    const namespaceId = namespaceIndex ? `gid://sagittarius/Namespace/${namespaceIndex}` as Namespace['id'] : undefined
    const runtimeId = runtimeIndex ? `gid://sagittarius/Runtime/${runtimeIndex}` as Runtime['id'] : undefined
    const userId = userIndex ? `gid://sagittarius/User/${userIndex}` as User['id'] : undefined
    const projectId = projectIndex ? `gid://sagittarius/NamespaceProject/${projectIndex}` as NamespaceProject['id'] : undefined
    const roleId = roleIndex ? `gid://sagittarius/NamespaceRole/${roleIndex}` as NamespaceRole['id'] : undefined

    const namespaceService = useService(NamespaceService)
    const namespaceStore = useStore(NamespaceService)
    const organizationService = useService(OrganizationService)
    const organizationStore = useStore(OrganizationService)
    const runtimeService = useService(RuntimeService)
    const runtimeStore = useStore(RuntimeService)
    const userService = useService(UserService)
    const userStore = useStore(UserService)
    const projectService = useService(ProjectService)
    const projectStore = useStore(ProjectService)
    const roleService = useService(RoleService)
    const roleStore = useStore(RoleService)

    const namespace = React.useMemo(() => namespaceId ? namespaceService.getById(namespaceId) : undefined, [namespaceStore, namespaceId])
    const namespaceOrganization = React.useMemo(() => namespace?.parent?.__typename === "Organization" ? organizationService.getById(namespace?.parent?.id) : undefined, [organizationStore, namespace])
    const namespaceUser = React.useMemo(() => namespace?.parent?.__typename === "User" ? userService.getById(namespace?.parent?.id) : undefined, [userStore, namespace])
    const runtime = React.useMemo(() => runtimeId ? runtimeService.getById(runtimeId) : undefined, [runtimeStore, runtimeId])
    const user = React.useMemo(() => userId ? userService.getById(userId) : undefined, [userStore, userId])
    const project = React.useMemo(() => projectId ? projectService.getById(projectId, namespaceId ? {namespaceId} : undefined) : undefined, [projectStore, projectId, namespaceId])
    const role = React.useMemo(() => roleId ? roleService.getById(roleId, namespaceId ? {namespaceId} : undefined) : undefined, [roleStore, roleId, namespaceId])

    const pathSegments = React.useMemo(() => path.split("/").filter(pathSegment => pathSegment.length > 0), [path])

    const namespaceLabel = React.useMemo(() => {
        if (namespaceOrganization?.name) return namespaceOrganization.name
        if (namespaceUser?.username) return namespaceUser.username
        const fallbackName = [namespaceUser?.firstname, namespaceUser?.lastname].filter(Boolean).join(" ")
        if (fallbackName) return fallbackName
        return namespaceIndex ? `Namespace ${namespaceIndex}` : undefined
    }, [namespaceOrganization, namespaceUser, namespaceIndex])

    const runtimeLabel = runtime?.name ?? (runtimeIndex ? `Runtime ${runtimeIndex}` : undefined)
    const userLabel = React.useMemo(() => {
        if (user?.username) return user.username
        const fallbackName = [user?.firstname, user?.lastname].filter(Boolean).join(" ")
        if (fallbackName) return fallbackName
        return userIndex ? `User ${userIndex}` : undefined
    }, [user, userIndex])
    const projectLabel = project?.name ?? (projectIndex ? `Project ${projectIndex}` : undefined)
    const roleLabel = role?.name ?? (roleIndex ? `Role ${roleIndex}` : undefined)

    const isRoutablePath = React.useCallback((segments: string[]) => {
        if (segments.length === 0) return true

        const [first, second, third, fourth, fifth, sixth, seventh] = segments

        if (first === "settings") {
            return segments.length === 1
        }

        if (first === "users") {
            if (segments.length === 1) return true
            if (segments.length === 2) return second === "invite" || second === userIndex
            return false
        }

        if (first === "runtimes") {
            if (segments.length === 1) return true
            if (segments.length === 2) return second === "create"
            if (segments.length === 3) return second === runtimeIndex && third === "settings"
            return false
        }

        if (first === "organizations") {
            if (segments.length === 1) return true
            return segments.length === 2 && second === "create"
        }

        if (first !== "namespace") {
            return segments.length === 1
        }

        if (segments.length === 1) return true
        if (segments.length === 2) return second === namespaceIndex
        if (segments.length === 3) {
            return second === namespaceIndex && ["settings", "projects", "members", "roles", "runtimes"].includes(third)
                || second === namespaceIndex && third === projectIndex
        }
        if (segments.length === 4) {
            if (second !== namespaceIndex) return false
            if (third === "projects") return fourth === "create"
            if (third === "members") return fourth === "add"
            if (third === "roles") return fourth === "create"
            if (third === "runtimes") return fourth === "create"
            if (third === projectIndex) return fourth === "@tabs"
            return false
        }
        if (segments.length === 5) {
            if (second !== namespaceIndex) return false
            if (third === "roles") return fourth === roleIndex && fifth === "settings"
            if (third === "runtimes") return fourth === runtimeIndex && fifth === "settings"
            if (third === projectIndex) return fourth === "@tabs" && fifth === "flow"
            return false
        }
        if (segments.length === 6) {
            if (second !== namespaceIndex) return false
            if (third === projectIndex) return fourth === "@tabs" && fifth === "flow" && sixth !== undefined
            return false
        }
        if (segments.length === 7) {
            if (second !== namespaceIndex) return false
            return third === projectIndex && fourth === "@tabs" && fifth === "flow" && sixth !== undefined
                && ["@files", "@flow"].includes(seventh ?? "")
        }
        return false
    }, [namespaceIndex, runtimeIndex, userIndex, projectIndex, roleIndex])

    const collectionSegments = React.useMemo(() => ({
        namespace: namespaceIndex,
        runtimes: runtimeIndex,
        users: userIndex,
        roles: roleIndex,
        projects: projectIndex,
    }), [namespaceIndex, runtimeIndex, userIndex, roleIndex, projectIndex])

    const getSegmentLabel = React.useCallback((segment: string, index: number) => {
        const previous = pathSegments[index - 1]
        if (segment === namespaceIndex && previous === "namespace") {
            return {label: namespaceLabel ?? segment, isBadge: true}
        }
        if (segment === runtimeIndex && previous === "runtimes") {
            return {label: runtimeLabel ?? segment, isBadge: true}
        }
        if (segment === userIndex && previous === "users") {
            return {label: userLabel ?? segment, isBadge: true}
        }
        if (segment === roleIndex && previous === "roles") {
            return {label: roleLabel ?? segment, isBadge: true}
        }
        if (segment === projectIndex && previous === namespaceIndex) {
            return {label: projectLabel ?? segment, isBadge: true}
        }
        return {label: segment.charAt(0).toUpperCase() + segment.slice(1), isBadge: false}
    }, [namespaceIndex, runtimeIndex, userIndex, roleIndex, projectIndex, namespaceLabel, runtimeLabel, userLabel, roleLabel, projectLabel, pathSegments])

    const resolveDestination = React.useCallback((segments: string[]) => {
        let destinationSegments = segments
        while (destinationSegments.length > 0 && !isRoutablePath(destinationSegments)) {
            destinationSegments = destinationSegments.slice(0, -1)
        }
        return destinationSegments
    }, [isRoutablePath])

    const breadcrumbs = React.useMemo(() => {
        return pathSegments.flatMap((segment, index) => {
            const nextSegment = pathSegments[index + 1]
            if (collectionSegments[segment as keyof typeof collectionSegments] && nextSegment === collectionSegments[segment as keyof typeof collectionSegments]) {
                return []
            }

            const destinationSegments = resolveDestination(pathSegments.slice(0, index + 1))
            if (destinationSegments.length === 0) {
                return []
            }

            const {label, isBadge} = getSegmentLabel(segment, index)

            return [{
                destination: `/${destinationSegments.join("/")}`,
                label,
                isBadge,
            }]
        })
    }, [pathSegments, collectionSegments, getSegmentLabel, resolveDestination])

    return <Breadcrumb>
        <Text hierarchy={"tertiary"} onClick={() => router.push("/")}>
            Home
        </Text>
        {breadcrumbs.map((crumb, index) => {
            return crumb.isBadge ? <Text hierarchy={"tertiary"} onClick={() => router.push(crumb.destination)}>
                {crumb.label}
            </Text> : <Text hierarchy={"tertiary"} key={`${crumb.destination}-${index}`} onClick={() => router.push(crumb.destination)}>
                {crumb.label}
            </Text>
        })}
    </Breadcrumb>
}
