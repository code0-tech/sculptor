"use client"

import React from "react";
import {
    Button,
    Card,
    DResizableHandle,
    DResizablePanel,
    DResizablePanelGroup,
    Flex,
    Spacing,
    Text,
    TextInput,
    toast,
    useForm,
    useService,
    useStore
} from "@code0-tech/pictor";
import {RuntimeService} from "@edition/runtime/Runtime.service";
import {notFound, useParams, useRouter} from "next/navigation";
import {Tab, TabContent, TabList, TabTrigger} from "@code0-tech/pictor/dist/components/tab/Tab";
import CardSection from "@code0-tech/pictor/dist/components/card/CardSection";
import {IconLayoutSidebar} from "@tabler/icons-react";

export const RuntimeSettingsPage: React.FC = () => {

    //TODO: add ability check for runtime settings access for every settings tab

    const params = useParams()
    const namespaceId = params.namespaceId as any as number
    const runtimeId = params.runtimeId as any as number

    const runtimeService = useService(RuntimeService)
    const runtimeStore = useStore(RuntimeService)
    const [, startTransition] = React.useTransition()
    const [token, setToken] = React.useState<string | null | undefined>(undefined)
    const router = useRouter()

    const runtime = React.useMemo(() => runtimeService.getById(`gid://sagittarius/Runtime/${runtimeId}`), [runtimeStore, params])

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


    return <Tab orientation={"vertical"} defaultValue={"general"} h={"100%"}>
        <DResizablePanelGroup>
            <DResizablePanel id={"1"} defaultSize={"20%"} collapsedSize={"0%"}
                             collapsible minSize={"10%"} style={{textWrap: "nowrap"}}>
                <Flex style={{flexDirection: "column", gap: "0.7rem"}}>
                    <Flex style={{gap: "0.7rem"}} align={"center"} justify={"space-between"}>
                        <Text size={"md"} hierarchy={"secondary"}>Runtime settings</Text>

                        <Button variant={"none"} paddingSize={"xxs"}>
                            <IconLayoutSidebar size={16}/>
                        </Button>
                    </Flex>
                    <Text size={"sm"} hierarchy={"tertiary"} style={{textWrap: "wrap"}}>
                        General settings and restrictions for your Sculptor application. These settings affect all users
                        and organizations within the application.
                    </Text>
                    <TabList>
                        <TabTrigger value={"general"} w={"100%"} asChild>
                            <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                                <Text size={"md"}>General</Text>
                            </Button>
                        </TabTrigger>
                        <TabTrigger value={"access"} w={"100%"} asChild>
                            <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                                <Text size={"md"}>How to connect</Text>
                            </Button>
                        </TabTrigger>
                        <TabTrigger value={"delete"} w={"100%"} asChild>
                            <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                                <Text size={"md"}>Delete</Text>
                            </Button>
                        </TabTrigger>
                    </TabList>
                </Flex>
            </DResizablePanel>
            <DResizableHandle/>
            <DResizablePanel id={"2"} color={"primary"} p={1}
                             style={{borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem"}}>
                <>
                    <TabContent value={"general"}>
                        <Flex justify={"space-between"} align={"end"}>
                            <Text size={"xl"} hierarchy={"primary"}>General</Text>
                            <Button color={"success"} onClick={validate}>
                                Save changes
                            </Button>
                        </Flex>
                        <Spacing spacing={"xl"}/>
                        <Card color={"secondary"}>
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
                    </TabContent>
                    <TabContent value={"access"}>
                        <Text size={"xl"} hierarchy={"primary"}>How to connect</Text>
                        <Spacing spacing={"xl"}/>
                        <Card color={"info"}>
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
                                        <Button variant={"filled"} onClick={rotateToken}>
                                            Generate new token
                                        </Button>
                                    )}
                                </Flex>
                            </CardSection>
                        </Card>

                    </TabContent>
                    <TabContent value={"delete"}>
                        <Flex justify={"space-between"} align={"end"}>
                            <Text size={"xl"} hierarchy={"primary"}>Delete</Text>
                        </Flex>
                        <Spacing spacing={"xl"}/>
                        <Card p={1.3} color={"error"}>
                            <Flex justify={"space-between"} align={"center"}>
                                <Flex style={{gap: ".35rem", flexDirection: "column"}}>
                                    <Text size={"md"} hierarchy={"primary"}>
                                        This will delete the runtime and cannot be undone.
                                    </Text>
                                </Flex>
                                <Button color={"secondary"} variant={"filled"} onClick={deleteRuntime}>
                                    Delete runtime
                                </Button>
                            </Flex>
                        </Card>
                    </TabContent>
                </>
            </DResizablePanel>
        </DResizablePanelGroup>
    </Tab>
}