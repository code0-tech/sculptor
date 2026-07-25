"use client"

import React, {startTransition} from "react";
import {Button, Spacing, TextInput, toast, useForm, useService} from "@code0-tech/pictor";
import {Namespace} from "@code0-tech/sagittarius-graphql-types";
import {addIslandSuccessNotification} from "@code0-tech/pictor/dist/components/island/Island.hook";
import {RoleService} from "@edition/role/services/Role.service";
import {InputDialog} from "@core/components/InputDialog";

export interface RoleCreateDialogComponentProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    namespaceId?: Namespace['id']
}

export const RoleCreateDialogComponent: React.FC<RoleCreateDialogComponentProps> = ({open, onOpenChange, namespaceId}) => {

    //TODO: user abilities for add role within namespace

    const roleService = useService(RoleService)

    const initialValues = React.useMemo(() => ({name: ""}), [])

    const [inputs, validate] = useForm({
        useInitialValidation: false,
        initialValues,
        validate: {
            name: (value) => {
                if (!value) return "Name is required"
                if (value.length < 3) return "Name needs to be at least 3 characters"
                if (value.length > 50) return "Name needs to be less than 50 characters"
                return null
            },
        },
        onSubmit: (values) => {
            startTransition(() => {
                if (!namespaceId) {
                    toast({
                        title: "The current user does not have a personal namespace.",
                        color: "error",
                        dismissible: true,
                    })
                    return
                }
                roleService.roleCreate({
                    name: values.name as unknown as string,
                    namespaceId: namespaceId
                }).then(payload => {
                    if ((payload?.errors?.length ?? 0) <= 0) {
                        addIslandSuccessNotification({message: "Created role"})
                        onOpenChange?.(false)
                    }
                })
            })
        }
    })

    return <InputDialog
        title={"Create new role"}
        description={"Roles bundle a set of permissions that you can assign to members of this namespace."}
        open={open}
        onOpenChange={(open) => onOpenChange?.(open)}>
        <TextInput required
                   w={"100%"}
                   title={"Name"}
                   description={"Provide a simple role name"}
                   placeholder={"E.g. Maintainer"}
                   {...inputs.getInputProps("name")}/>
        <Spacing spacing={"xl"}/>
        <Button color={"success"} w={"100%"} onClick={validate}>Create role</Button>
    </InputDialog>
}
