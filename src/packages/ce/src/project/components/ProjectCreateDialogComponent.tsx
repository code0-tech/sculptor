"use client"

import React, {startTransition} from "react";
import {Button, Spacing, TextInput, toast, useForm, useService} from "@code0-tech/pictor";
import {Namespace} from "@code0-tech/sagittarius-graphql-types";
import {ProjectService} from "@edition/project/services/Project.service";
import {InputDialog} from "@core/components/InputDialog";

export interface ProjectCreateDialogComponentProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    namespaceId?: Namespace['id']
}

export const ProjectCreateDialogComponent: React.FC<ProjectCreateDialogComponentProps> = ({open, onOpenChange, namespaceId}) => {

    //TODO: user abilities for project creation within namespace

    const projectService = useService(ProjectService)

    const initialValues = React.useMemo(() => ({name: null, description: null}), [])

    const [inputs, validate] = useForm<{ name: string | null, description: string | null }>({
        useInitialValidation: false,
        initialValues: initialValues,
        validate: {
            name: (value) => {
                if (!value) return "Name is required"
                if (value.length < 3) return "Name needs to be at least 3 characters"
                if (value.length > 50) return "Name needs to be less than 50 characters"
                return null
            },
            description: (value) => {
                if (!value) return "Description is required"
                if (value.length > 50) return "Description needs to be less than 50 characters"
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
                projectService.projectCreate({
                    name: values.name!!,
                    description: values.description!!,
                    namespaceId: namespaceId
                }).then(payload => {
                    if ((payload?.errors?.length ?? 0) <= 0) {
                        onOpenChange?.(false)
                    }
                })
            })
        }
    })

    return <InputDialog
        title={"Create new project"}
        description={"Projects group the flows, modules and runtimes you build within this workspace."}
        open={open}
        onOpenChange={(open) => onOpenChange?.(open)}>
        <TextInput data-qa-selector={"dashboard-namespace-project-create-name"}
                   required
                   w={"100%"}
                   title={"Name"}
                   description={"Provide a simple project name"}
                   placeholder={"E.g. User management"}
                   {...inputs.getInputProps("name")}/>
        <Spacing spacing={"md"}/>
        <TextInput data-qa-selector={"dashboard-namespace-project-create-description"}
                   required
                   w={"100%"}
                   title={"Description"}
                   description={"Provide a simple project description"}
                   placeholder={"E.g. Manage and authenticate users with rest routes"}
                   {...inputs.getInputProps("description")}/>
        <Spacing spacing={"xl"}/>
        <Button data-qa-selector={"dashboard-namespace-project-create-send"}
                color={"success"} w={"100%"} onClick={validate}>Create project</Button>
    </InputDialog>
}
