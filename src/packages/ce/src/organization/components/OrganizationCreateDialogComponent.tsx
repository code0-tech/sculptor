"use client"

import React, {startTransition} from "react";
import {Button, Flex, Spacing, TextInput, useForm, useService} from "@code0-tech/pictor";
import {OrganizationService} from "@edition/organization/services/Organization.service";
import {UserService} from "@edition/user/services/User.service";
import {InputDialog} from "@core/components/InputDialog";

export interface OrganizationCreateDialogComponentProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export const OrganizationCreateDialogComponent: React.FC<OrganizationCreateDialogComponentProps> = ({open, onOpenChange}) => {

    const organizationService = useService(OrganizationService)
    const userService = useService(UserService)

    const initialValues = React.useMemo(() => ({
        name: ""
    }), [])

    const [inputs, validate] = useForm({
        useInitialValidation: false,
        initialValues,
        validate: {
            name: (value) => {
                if (!value) return "Name is required"
                return null
            }
        },
        onSubmit: (values) => {
            startTransition(() => {
                organizationService.organizationCreate({
                    name: values.name as unknown as string
                }).then(payload => {
                    if ((payload?.errors?.length ?? 0) <= 0) {
                        userService.refetchCurrentUser().then(() => onOpenChange?.(false))
                    }
                })
            })
        }
    })

    return <InputDialog
        title={"Create new organization"}
        description={"Organizations are helpful if managing a group of users and plenty of projects."}
        open={open}
        onOpenChange={(open) => onOpenChange?.(open)}>
        <TextInput data-qa-selector={"dashboard-organization-create-name"}
                   required
                   w={"100%"}
                   title={"Name"}
                   description={"Provide a simple organization name"}
                   placeholder={"E.g. CodeZero"}
                   {...inputs.getInputProps("name")}/>
        <Spacing spacing={"xl"}/>
        <Flex justify={"end"}>
            <Button data-qa-selector={"dashboard-organization-create-send"} color={"success"} onClick={validate}>
                Create organization
            </Button>
        </Flex>
    </InputDialog>
}
