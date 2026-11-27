"use client"

import React, {startTransition} from "react";
import {Button, Spacing, TagValue, useForm, useService, useStore} from "@code0-tech/pictor";
import {Namespace, User} from "@code0-tech/sagittarius-graphql-types";
import {toast} from "@code0-tech/pictor/dist/components/toast/Toast";
import {MemberService} from "@edition/member/services/Member.service";
import {UserService} from "@edition/user/services/User.service";
import {UserInputComponent} from "@edition/user/components/UserInputComponent";
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
    const [submitted, setSubmitted] = React.useState(false)
    // The member list arrives after the dialog opens, and filtering against an
    // empty one offers users who already are members - a namespace always has at
    // least its owner, so an empty list means "not here yet", not "nobody".
    const filteredUsers = React.useMemo(() => {
        return (user: User) => {
            return members.length > 0 && !members.find(m => m.user?.id === user.id)
        }
    }, [members])

    const [inputs, validate] = useForm<{ users: null | TagValue[] }>({
        useInitialValidation: false,
        initialValues: initialValues,
        validate: {
            users: (value) => {
                if (!value || value.length <= 0) return "Please select at least one user"
                return null
            }
        },
        onSubmit: (values) => {
            startTransition(async () => {
                if (!namespaceId) return

                const payload = await memberService.memberBulkInvite({
                    namespaceId: namespaceId,
                    userIds: values.users!!
                        .map(tag => (tag.valueData as User).id!!)
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
        <UserInputComponent title={"Users"}
                            description={"Select the users you want to add as members"}
                            filter={filteredUsers}
                            onChange={() => submitted && validate("users")}
                            {...inputs.getInputProps("users")}/>
        <Spacing spacing={"xl"}/>
        <Button color={"success"} w={"100%"} onClick={() => {
            setSubmitted(true)
            validate()
        }}>Add members</Button>
    </InputDialog>
}
