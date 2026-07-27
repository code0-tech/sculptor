"use client"

import React from "react";
import {useParams, useRouter} from "next/navigation";
import {Button, DialogClose, Spacing, Text, useService} from "@code0-tech/pictor";
import {RoleService} from "@edition/role/services/Role.service";
import {MemberService} from "@edition/member/services/Member.service";
import type {NamespaceRole} from "@code0-tech/sagittarius-graphql-types";
import {TabContent} from "@code0-tech/pictor/dist/components/tab/Tab";
import {toast} from "@code0-tech/pictor/dist/components/toast/Toast";

export const RoleDeleteView: React.FC = () => {

    const params = useParams()
    const router = useRouter()
    const roleService = useService(RoleService)
    const memberService = useService(MemberService)
    const [, startTransition] = React.useTransition()

    const namespaceIndex = params.namespaceId as any as number
    const roleIndex = params.roleId as any as number
    const roleId: NamespaceRole['id'] = `gid://sagittarius/NamespaceRole/${roleIndex}`

    const deleteRole = React.useCallback(() => {
        startTransition(() => {
            roleService.roleDelete({
                namespaceRoleId: roleId
            }).then(payload => {
                if ((payload?.errors?.length ?? 0) <= 0) {
                    memberService.removeRoleFromMembers(roleId)
                    toast({title: "Deleted role", color: "success"})
                }
                router.push(`/namespace/${namespaceIndex}/settings`)
            })
        })
    }, [])

    return <TabContent pl={"0.7"} value={"delete"} style={{overflow: "hidden"}}>
        <Text size={"lg"} hierarchy={"primary"} display={"block"}>Delete role</Text>
        <Spacing spacing={"xs"}/>
        <Text size={"md"} hierarchy={"tertiary"}>
            Permanently delete this role and unassign it from all members. This action cannot be undone.
        </Text>
        <Spacing spacing={"md"}/>
        <DialogClose asChild>
            <Button color={"error"} w={"100%"} onClick={deleteRole}>Delete role</Button>
        </DialogClose>
    </TabContent>

}