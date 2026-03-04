"use client"

import React, {startTransition} from "react";
import {
    Badge,
    Button,
    Card,
    Flex,
    Spacing,
    TabContent,
    Text,
    TextInput,
    toast,
    useForm,
    useService,
    useStore
} from "@code0-tech/pictor";
import CardSection from "@code0-tech/pictor/dist/components/card/CardSection";
import {useParams} from "next/navigation";
import {ProjectService} from "@edition/project/services/Project.service";

export const ProjectSettingsGeneralView: React.FC = () => {

    const params = useParams()
    const projectService = useService(ProjectService)
    const projectStore = useStore(ProjectService)

    const projectId = params.projectId as any as number

    const project = React.useMemo(
        () => projectService.getById(`gid://sagittarius/NamespaceProject/${projectId}`),
        [projectStore, projectId]
    )

    const initialValues = React.useMemo(
        () => ({
            name: project?.name,
            description: project?.description,
            slug: project?.slug,
        }),
        [project]
    )

    const [inputs, validate] = useForm({
        initialValues: initialValues,
        validate: {
            name: (value) => {
                if (!value) return "Name is required"
                return null
            },
            slug: (value) => {
                if (!value) return "Slug is required"
                if (value.length < 3) return "Slug needs to be at least 3 characters"
                if (value.length > 50) return "Slug needs to be less than 50 characters"
                return null
            }
        },
        onSubmit: (values) => {
            startTransition(() => {
                projectService.projectUpdate({
                    slug: values.slug,
                    name: values.name,
                    description: values.description,
                    namespaceProjectId: `gid://sagittarius/NamespaceProject/${projectId}`
                }).then(payload => {
                    if ((payload?.errors?.length ?? 0) <= 0) {
                        toast({
                            title: "The project was successfully deleted.",
                            color: "success",
                            dismissible: true,
                        })
                    }
                })
            })
        }
    })

    return <TabContent value={"general"}>
        <Flex justify={"space-between"} align={"start"}>
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
                    <TextInput {...inputs.getInputProps("name")}/>
                </Flex>
            </CardSection>
            <CardSection border>
                <Flex justify={"space-between"} align={"center"}>
                    <Text size={"md"} hierarchy={"primary"}>Description</Text>
                    <TextInput {...inputs.getInputProps("description")}/>
                </Flex>
            </CardSection>
            <CardSection border>
                <Flex justify={"space-between"} align={"center"}>
                    <Flex style={{gap: ".35rem", flexDirection: "column"}}>
                        <Text size={"md"} hierarchy={"primary"}>Slug</Text>
                        <Text size={"md"} hierarchy={"tertiary"}>
                            A slug is used as a prefix for calls to a specific flow inside a project e.g. {" "}
                            <Badge>
                                <Badge color={"info"} ml={-0.2}>
                                    <Text size={"md"} hierarchy={"tertiary"}>
                                        /{project?.slug}
                                    </Text>
                                </Badge>
                                <Text size={"md"} hierarchy={"tertiary"}>
                                    /your-flow-slug
                                </Text>
                            </Badge>.
                            This is only effective for flow types using a slug as an identifier.
                        </Text>
                    </Flex>
                    <TextInput {...inputs.getInputProps("slug")}/>
                </Flex>
            </CardSection>
        </Card>
    </TabContent>

}