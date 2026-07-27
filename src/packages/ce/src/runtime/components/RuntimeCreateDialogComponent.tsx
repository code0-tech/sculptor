"use client"

import React, {startTransition} from "react";
import {
    Button,
    Spacing,
    TextInput,
    toast,
    useForm,
    useService
} from "@code0-tech/pictor";
import {RuntimeService} from "@edition/runtime/services/Runtime.service";
import {Namespace} from "@code0-tech/sagittarius-graphql-types";
import {InputDialog} from "@core/components/InputDialog";

export interface RuntimeCreateDialogComponentProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    namespaceId?: Namespace['id']
}

export const RuntimeCreateDialogComponent: React.FC<RuntimeCreateDialogComponentProps> = ({open, onOpenChange, namespaceId}) => {

    const runtimeService = useService(RuntimeService)
    const [token, setToken] = React.useState<string | null | undefined>(undefined)

    const initialValues = React.useMemo(
        () => ({
            name: "",
            description: "",
        }),
        []
    )

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
            description: (value) => {
                if (!value) return "Description is required"
                if ((value as string).length > 50) return "Description needs to be less than 50 characters"
                return null
            }
        },
        onSubmit: (values) => {
            startTransition(() => {
                runtimeService.runtimeCreate({
                    name: values.name as unknown as string,
                    description: values.description as unknown as string,
                    ...(namespaceId ? {namespaceId} : {})
                }).then(payload => {
                    if ((payload?.errors?.length ?? 0) <= 0) {
                        if (payload?.runtime?.token) {
                            setToken(payload.runtime.token)
                            toast({title: "Created runtime", color: "success"})
                        } else {
                            toast({
                                title: "The runtime was created but no token was provided.",
                                color: "error",
                            })
                            onOpenChange?.(false)
                        }
                    }
                })
            })
        }
    })

    return <InputDialog
        title={!token ? "Create new runtime" : "Runtime created"}
        description={!token
            ? "Global runtimes are the environments where your applications run across all workspaces."
            : "Copy this token now — it links your runtime to Sculptor and won't be shown again."}
        open={open}
        onOpenChange={(open) => onOpenChange?.(open)}>
        {!token ? (
            <>
                <TextInput required
                           w={"100%"}
                           title={"Name"}
                           description={"Provide a simple runtime name"}
                           placeholder={"E.g. CodeZero Runtime #1"}
                           {...inputs.getInputProps("name")}/>
                <Spacing spacing={"md"}/>
                <TextInput required
                           w={"100%"}
                           title={"Description"}
                           description={"Provide a simple runtime description"}
                           placeholder={"E.g. CodeZero main http runtime"}
                           {...inputs.getInputProps("description")}/>
            </>
        ) : (
            <TextInput required
                       w={"100%"}
                       title={"Token"}
                       value={token}
                       description={"This token is used to link your runtime to our internal system."}/>
        )}
        <Spacing spacing={"xl"}/>
        {!token ? (
            <Button color={"success"} w={"100%"} onClick={validate}>Create runtime</Button>
        ) : (
            <Button color={"success"} w={"100%"} onClick={() => onOpenChange?.(false)}>Done</Button>
        )}
    </InputDialog>
}
