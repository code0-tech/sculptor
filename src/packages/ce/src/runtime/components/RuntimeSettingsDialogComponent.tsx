"use client"

import React from "react";
import {Button, DialogClose, Flex, Spacing, Text, TextInput, useForm, useService, useStore} from "@code0-tech/pictor";
import {TabContent, TabList, TabTrigger} from "@code0-tech/pictor/dist/components/tab/Tab";
import {Runtime} from "@code0-tech/sagittarius-graphql-types";
import {RuntimeService} from "@edition/runtime/services/Runtime.service";
import {useRouter} from "next/navigation";
import {toast} from "@code0-tech/pictor/dist/components/toast/Toast";
import {IconBackground, IconPlugConnected, IconTrash} from "@tabler/icons-react";
import {SettingDialog} from "@core/components/SettingDialog";

export interface RuntimeSettingsDialogComponentProps {
    runtimeId?: Runtime['id']
    namespaceId?: number
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export const RuntimeSettingsDialogComponent: React.FC<RuntimeSettingsDialogComponentProps> = (props) => {

    const {runtimeId, namespaceId, open, onOpenChange} = props

    const runtimeService = useService(RuntimeService)
    const runtimeStore = useStore(RuntimeService)
    const [, startTransition] = React.useTransition()
    const [token, setToken] = React.useState<string | null | undefined>(undefined)
    const router = useRouter()

    const runtime = React.useMemo(
        () => runtimeService.getById(runtimeId),
        [runtimeStore, runtimeId]
    )

    const initialValues = React.useMemo(() => ({
        name: runtime?.name,
        description: runtime?.description,
    }), [runtime])

    const [inputs, validate] = useForm({
        useInitialValidation: false,
        initialValues: initialValues,
        validate: {
            name: (value) => {
                if (!value) return "Name is required"
                return null
            },
            description: (value) => {
                if (!value) return "Description is required"
                return null
            }
        },
        onSubmit: (values) => {
            if (!runtime) return
            startTransition(() => {
                runtimeService.runtimeUpdate({
                    name: values.name as unknown as string,
                    description: values.description as unknown as string,
                    runtimeId: runtime.id!
                }).then(payload => {
                    if ((payload?.errors?.length ?? 0) <= 0) {
                        toast({title: "Updated runtime", color: "success"})
                    }
                })
            })
        }
    })

    const deleteRuntime = React.useCallback(() => {
        if (!runtime) return
        startTransition(() => {
            runtimeService.runtimeDelete({
                runtimeId: runtime.id!
            }).then(payload => {
                if ((payload?.errors?.length ?? 0) <= 0) {
                    toast({title: "Deleted runtime", color: "success"})
                }
                onOpenChange?.(false)
                router.push(namespaceId ? `/namespace/${namespaceId}/runtimes` : "/runtimes")
            })
        })
    }, [runtime, namespaceId, onOpenChange, router])

    const rotateToken = React.useCallback(() => {
        if (!runtime) return
        startTransition(() => {
            runtimeService.runtimeRotateToken({
                runtimeId: runtime.id!
            }).then(payload => {
                if ((payload?.errors?.length ?? 0) <= 0) {
                    if (payload?.runtime?.token) {
                        setToken(payload.runtime.token)
                        toast({title: "Rotated runtime token", color: "success"})
                    }
                }
            })
        })
    }, [runtime])

    return <SettingDialog open={open}
                          onOpenChange={(open) => onOpenChange?.(open)}
                          title={`Settings of ${runtime?.name ?? ""}`}
                          description={"General settings and restrictions for your runtime. These settings affect how the runtime connects to and behaves within your Sculptor application."}
                          trigger={<TabList>
                              <TabTrigger value={"general"} w={"100%"} asChild>
                                  <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                                      <IconBackground size={13}/>
                                      <Text size={"md"}>General</Text>
                                  </Button>
                              </TabTrigger>
                              <TabTrigger value={"access"} w={"100%"} asChild>
                                  <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                                      <IconPlugConnected size={13}/>
                                      <Text size={"md"}>How to connect</Text>
                                  </Button>
                              </TabTrigger>
                              <TabTrigger value={"delete"} w={"100%"} asChild>
                                  <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                                      <IconTrash size={13}/>
                                      <Text size={"md"}>Delete</Text>
                                  </Button>
                              </TabTrigger>
                          </TabList>}>
        <TabContent value={"general"} style={{overflow: "hidden"}}>
            <Flex justify={"space-between"} align={"center"}>
                <Text size={"lg"} hierarchy={"primary"} display={"block"}>General</Text>
                <Button paddingSize={"xxs"} color={"success"} variant={"none"} onClick={validate}>
                    Save changes
                </Button>
            </Flex>
            <Spacing spacing={"xs"}/>
            <Text size={"md"} hierarchy={"tertiary"}>
                General configuration for your runtime, including the name and description used to recognise it.
            </Text>
            <Spacing spacing={"md"}/>
            <TextInput w={"100%"}
                       placeholder={"Name"}
                       title={"Name"}
                       description={"The name used to identify this runtime."}
                       {...inputs.getInputProps("name")}/>
            <Spacing spacing={"md"}/>
            <TextInput w={"100%"}
                       placeholder={"Description"}
                       title={"Description"}
                       description={"A short summary of what this runtime is used for."}
                       {...inputs.getInputProps("description")}/>
        </TabContent>
        <TabContent value={"access"} style={{overflow: "hidden"}}>
            <Text size={"lg"} hierarchy={"primary"} display={"block"}>How to connect</Text>
            <Spacing spacing={"xs"}/>
            <Text size={"md"} hierarchy={"tertiary"}>
                Connect your runtime to Sculptor using an access token. Keep it secret and rotate it when exposed.
            </Text>
            <Spacing spacing={"md"}/>
            {token ? (
                <TextInput w={"100%"} value={runtime?.token ?? ""}/>
            ) : (
                <Button color={"tertiary"} w={"100%"} onClick={rotateToken}>
                    Generate new token
                </Button>
            )}
        </TabContent>
        <TabContent value={"delete"} style={{overflow: "hidden"}}>
            <Text size={"lg"} hierarchy={"primary"} display={"block"}>Delete runtime</Text>
            <Spacing spacing={"xs"}/>
            <Text size={"md"} hierarchy={"tertiary"}>
                Permanently remove this runtime from your application. This action cannot be undone.
            </Text>
            <Spacing spacing={"md"}/>
            <DialogClose asChild>
                <Button color={"error"} w={"100%"} onClick={deleteRuntime}>Delete runtime</Button>
            </DialogClose>
        </TabContent>
    </SettingDialog>
}
