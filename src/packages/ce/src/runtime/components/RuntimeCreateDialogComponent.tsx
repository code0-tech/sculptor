"use client"

import React, {startTransition} from "react";
import {
    Button,
    Dialog,
    DialogClose,
    DialogContent,
    DialogOverlay,
    DialogPortal,
    Flex,
    Spacing,
    Text,
    TextInput,
    toast,
    useForm,
    useService
} from "@code0-tech/pictor";
import {RuntimeService} from "@edition/runtime/services/Runtime.service";
import {Namespace} from "@code0-tech/sagittarius-graphql-types";
import {addIslandSuccessNotification} from "@code0-tech/pictor/dist/components/island/Island.hook";

export interface RuntimeCreateDialogComponentProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    namespaceId?: Namespace['id']
}

export const RuntimeCreateDialogComponent: React.FC<RuntimeCreateDialogComponentProps> = ({open, onOpenChange, namespaceId}) => {

    const runtimeService = useService(RuntimeService)
    const [token, setToken] = React.useState<string | null | undefined>(undefined)

    const [inputs, validate] = useForm({
        useInitialValidation: false,
        initialValues: {
            name: "",
            description: "",
        },
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
                            addIslandSuccessNotification({message: "Created runtime"})
                        } else {
                            toast({
                                title: "The runtime was created but no token was provided.",
                                color: "error",
                                dismissible: true,
                            })
                            onOpenChange?.(false)
                        }
                    }
                })
            })
        }
    })

    return <Dialog open={open} onOpenChange={(open) => onOpenChange?.(open)}>
        <DialogPortal>
            <DialogOverlay/>
            <DialogContent autoFocus showCloseButton
                           title={!token ? "Create new runtime" : "Runtime created"}>
                <Spacing spacing={"xs"}/>
                <Text size={"md"} hierarchy={"tertiary"} display={"block"}>
                    {!token
                        ? "Global runtimes are the environments where your applications run across all workspaces."
                        : "Copy this token now — it links your runtime to Sculptor and won't be shown again."}
                </Text>
                <Spacing spacing={"xl"}/>
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
                <Flex justify={"space-between"} align={"center"}>
                    <DialogClose asChild>
                        <Button color={"tertiary"}>{!token ? "Cancel" : "Done"}</Button>
                    </DialogClose>
                    {!token ? (
                        <Button color={"success"} onClick={validate}>Create runtime</Button>
                    ) : null}
                </Flex>
            </DialogContent>
        </DialogPortal>
    </Dialog>
}
