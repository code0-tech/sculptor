"use client"

import React from "react";
import {
    Button,
    Card,
    DLayout,
    Flex,
    InputLabel,
    Spacing,
    Text,
    TextInput,
    toast,
    useForm,
    useService,
    useStore, useUserSession
} from "@code0-tech/pictor";
import {RuntimeService} from "@edition/runtime/Runtime.service";
import {notFound, useParams, useRouter} from "next/navigation";
import {Tab, TabContent, TabList, TabTrigger} from "@code0-tech/pictor/dist/components/tab/Tab";
import {IconGavel, IconSettings} from "@tabler/icons-react";
import CardSection from "@code0-tech/pictor/dist/components/card/CardSection";
import {UserService} from "@edition/user/User.service";

export const RuntimeSettingsPage: React.FC = () => {

    const params = useParams()
    const namespaceId = params.namespaceId as any as number
    const runtimeId = params.runtimeId as any as number

    const runtimeService = useService(RuntimeService)
    const runtimeStore = useStore(RuntimeService)
    const [, startTransition] = React.useTransition()
    const [token, setToken] = React.useState<string | null | undefined>(undefined)
    const router = useRouter()
    const currentSession = useUserSession()
    const userStore = useStore(UserService)
    const userService = useService(UserService)
    const currentUser = React.useMemo(() => userService.getById(currentSession?.user?.id), [userStore, currentSession])

    const runtime = React.useMemo(() => runtimeService.getById(`gid://sagittarius/Runtime/${runtimeId}`), [runtimeStore, params])

    if (currentUser && !currentUser.admin) {
        notFound()
    }

    if (runtime?.userAbilities && (!runtime?.userAbilities?.updateRuntime || !runtime.userAbilities.deleteRuntime || !runtime.userAbilities.rotateRuntimeToken)) {
        notFound()
    }

    const initialValues = React.useMemo(() => ({
        name: runtime?.name,
        description: runtime?.description,
    }), [runtime])

    const [inputs, validate] = useForm({
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
            startTransition(() => {
                runtimeService.runtimeUpdate({
                    name: values.name as unknown as string,
                    description: values.description as unknown as string,
                    runtimeId: runtime?.id!!
                }).then(payload => {
                    if ((payload?.errors?.length ?? 0) <= 0) {
                        toast({
                            title: "The runtime was successfully updated.",
                            color: "success",
                            dismissible: true,
                        })
                    }
                })
            })
        }
    })

    const deleteRuntime = React.useCallback(() => {
        startTransition(() => {
            runtimeService.runtimeDelete({
                runtimeId: runtime?.id!!
            }).then(payload => {
                if ((payload?.errors?.length ?? 0) <= 0) {
                    toast({
                        title: "The runtime was successfully deleted.",
                        color: "success",
                        dismissible: true,
                    })
                }
                router.push(namespaceId ? `/namespace/${namespaceId}/runtimes` : "/runtimes")
            })
        })
    }, [runtime, router])

    const rotateToken = React.useCallback(() => {
        startTransition(() => {
            runtimeService.runtimeRotateToken({
                runtimeId: runtime?.id!!
            }).then(payload => {
                if ((payload?.errors?.length ?? 0) <= 0) {
                    if (payload?.runtime?.token) {
                        setToken(payload.runtime.token)
                        toast({
                            title: "The runtime token was successfully rotated.",
                            color: "success",
                            dismissible: true,
                        })
                    }
                }
            })
        })
    }, [runtime])


    return <>
        <Spacing spacing={"xl"}/>
        <Flex style={{flexDirection: "column", gap: "0.35rem"}}>
            <Text size={"lg"} hierarchy={"primary"} display={"block"}>
                {runtime?.name}
            </Text>
            <Text size={"sm"} hierarchy={"tertiary"} display={"block"}>
                {runtime?.description}
            </Text>
        </Flex>
        <Spacing spacing={"xl"}/>
        <Tab orientation={"vertical"} defaultValue={"general"}>
            <DLayout leftContent={
                <TabList>
                    <InputLabel>Runtime</InputLabel>
                    <TabTrigger value={"general"}>
                        <Button paddingSize={"xxs"} variant={"none"}>
                            <Text size={"md"} hierarchy={"primary"}>General</Text>
                        </Button>
                    </TabTrigger>
                    <TabTrigger value={"access"}>
                        <Button paddingSize={"xxs"} variant={"none"}>
                            <Text size={"md"} hierarchy={"primary"}>Access</Text>
                        </Button>
                    </TabTrigger>
                </TabList>
            }>
                <>
                    <TabContent value={"general"}>
                        <Flex justify={"space-between"} align={"end"}>
                            <Text size={"xl"} hierarchy={"primary"}>General</Text>
                            <Button color={"success"} onClick={validate}>
                                Update Runtime
                            </Button>
                        </Flex>
                        <Spacing spacing={"xl"}/>
                        <div style={{borderBottom: "1px solid rgba(255,255,255,.1)"}}/>
                        <Spacing spacing={"xl"}/>
                        <Card p={1.3}>
                            <CardSection border>
                                <Flex justify={"space-between"} align={"center"}>
                                    <Text size={"md"} hierarchy={"primary"}>Name</Text>
                                    <TextInput{...inputs.getInputProps("name")}/>
                                </Flex>
                            </CardSection>
                            <CardSection border>
                                <Flex justify={"space-between"} align={"center"}>
                                    <Text size={"md"} hierarchy={"primary"}>Description</Text>
                                    <TextInput
                                        {...inputs.getInputProps("description")}
                                    />
                                </Flex>
                            </CardSection>
                        </Card>
                        <Spacing spacing={"xl"}/>
                        <Text size={"xl"} hierarchy={"primary"}>Danger zone</Text>
                        <Spacing spacing={"xl"}/>
                        <div style={{borderBottom: "1px solid rgba(255,255,255,.1)"}}/>
                        <Spacing spacing={"xl"}/>
                        <Card p={1.3} color={"error"}>
                            <Flex justify={"space-between"} align={"center"}>
                                <Flex style={{gap: ".35rem", flexDirection: "column"}}>
                                    <Text size={"md"} hierarchy={"primary"}>Delete runtime</Text>
                                    <Text size={"md"} hierarchy={"tertiary"}>
                                        This will delete the runtime and cannot be undone.
                                    </Text>
                                </Flex>
                                <Button color={"error"} onClick={deleteRuntime}>
                                    Delete runtime forever
                                </Button>
                            </Flex>
                        </Card>
                    </TabContent>
                    <TabContent value={"access"}>
                        <Text size={"xl"} hierarchy={"primary"}>Access</Text>
                        <Spacing spacing={"xl"}/>
                        <div style={{borderBottom: "1px solid rgba(255,255,255,.1)"}}/>
                        <Spacing spacing={"xl"}/>
                        <Card p={1.3} color={"warning"}>
                            <CardSection border>
                                <Flex justify={"space-between"} align={"center"}>
                                    <Flex style={{gap: ".35rem", flexDirection: "column"}}>
                                        <Text size={"md"} hierarchy={"primary"}>Access token</Text>
                                        <Text size={"md"} hierarchy={"tertiary"}>Is used to connect the runtime to our
                                            service</Text>
                                    </Flex>
                                    {token ? (
                                        <TextInput value={runtime?.token ?? ""}/>
                                    ) : (
                                        <Button onClick={rotateToken}>
                                            Generate new token
                                        </Button>
                                    )}
                                </Flex>
                            </CardSection>
                        </Card>

                    </TabContent>
                </>
            </DLayout>
        </Tab>
    </>
}