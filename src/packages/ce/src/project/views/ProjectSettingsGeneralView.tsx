"use client"

import React, {startTransition} from "react";
import {
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
import {Namespace, NamespaceProject} from "@code0-tech/sagittarius-graphql-types";

export const ProjectSettingsGeneralView: React.FC = () => {

    const params = useParams()
    const projectService = useService(ProjectService)
    const projectStore = useStore(ProjectService)

    const projectIndex = params.projectId as any as number
    const namespaceIndex = params.namespaceId as any as number
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex}`
    const projectId: NamespaceProject['id'] = `gid://sagittarius/NamespaceProject/${projectIndex}`

    const project = React.useMemo(
        () => projectService.getById(projectId, {
            namespaceId: namespaceId
        }),
        [projectStore, projectService]
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
                    namespaceProjectId: projectId
                }).then(payload => {
                    if ((payload?.errors?.length ?? 0) <= 0) {
                        toast({
                            title: "The project was successfully updated.",
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
                    <TextInput miw={"200px"} {...inputs.getInputProps("name")}/>
                </Flex>
            </CardSection>
            <CardSection border>
                <Flex justify={"space-between"} align={"center"}>
                    <Text size={"md"} hierarchy={"primary"}>Description</Text>
                    <TextInput miw={"200px"} {...inputs.getInputProps("description")}/>
                </Flex>
            </CardSection>
            <CardSection border>
                <Flex justify={"space-between"} align={"center"}>
                    <Flex style={{gap: ".35rem", flexDirection: "column"}}>
                        <Text size={"md"} hierarchy={"primary"}>Slug</Text>
                        <Text size={"md"} hierarchy={"tertiary"}>
                            Think of this as your project’s unique nickname in a web address. It helps distinguish this
                            project from others when using URL-based connections (like REST flows).
                        </Text>
                    </Flex>
                    <TextInput miw={"200px"} {...inputs.getInputProps("slug")}/>
                </Flex>
            </CardSection>
        </Card>
    </TabContent>

}