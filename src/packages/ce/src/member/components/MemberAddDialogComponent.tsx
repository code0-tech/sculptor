"use client"

import React, {startTransition} from "react";
import {Button, Spacing, useForm, useService, useStore} from "@code0-tech/pictor";
import {Namespace, User} from "@code0-tech/sagittarius-graphql-types";
import {toast} from "@code0-tech/pictor/dist/components/toast/Toast";
import {MemberService} from "@edition/member/services/Member.service";
import {UserService} from "@edition/user/services/User.service";
import {UserInputComponent, UserSyntaxSegment} from "@edition/user/components/UserInputComponent";
import {InputDialog} from "@core/components/InputDialog";

export interface MemberAddDialogComponentProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    namespaceId?: Namespace['id']
}

export const MemberAddDialogComponent: React.FC<MemberAddDialogComponentProps> = ({open, onOpenChange, namespaceId}) => {

    //TODO: user abilities for add user as member within namespace

    const memberService = useService(MemberService)
    const memberStore = useStore(MemberService)
    const userService = useService(UserService)
    const userStore = useStore(UserService)

    const members = React.useMemo(
        () => namespaceId ? memberService.values({namespaceId: namespaceId}) : [],
        [memberStore, userStore, namespaceId]
    )
    const initialValues = React.useMemo(() => ({users: null}), [])
    const filteredUsers = React.useMemo(() => {
        return (user: User) => {
            return !members.find(m => m.user?.id === user.id)
        }
    }, [members])

    const [inputs, validate] = useForm<{ users: null | UserSyntaxSegment[] }>({
        useInitialValidation: false,
        initialValues: initialValues,
        validate: {
            users: (value) => {
                if (!value) return "Please select at least one user"
                if (value.filter(segment => segment.type === "block").length <= 0) return "Please select at least one user"
                return null
            }
        },
        onSubmit: (values) => {
            startTransition(async () => {
                if (!namespaceId) return

                const payload = await memberService.memberBulkInvite({
                    namespaceId: namespaceId,
                    userIds: values.users!!
                        .filter(segment => segment.type === "block")
                        .map(segment => segment.valueData!!.id!!)
                })

                if ((payload?.errors?.length ?? 0) <= 0) {
                    toast({title: "Added members", color: "success"})
                    onOpenChange?.(false)
                }
            })
        }
    })

    return <InputDialog
        title={"Add new members"}
        description={"Add users to this workspace as members. They gain access based on the roles you assign to them."}
        open={open}
        onOpenChange={(open) => onOpenChange?.(open)}>
        {/*@ts-ignore*/}
        <UserInputComponent title={"Users"}
                            description={"Select the users you want to add as members"}
                            filter={filteredUsers}
                            validationUsesSyntax
                            {...inputs.getInputProps("users")}/>
        <Spacing spacing={"xl"}/>
        <Button color={"success"} w={"100%"} onClick={validate}>Add members</Button>
    </InputDialog>
}
