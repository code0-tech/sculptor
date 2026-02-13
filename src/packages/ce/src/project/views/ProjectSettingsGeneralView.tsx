"use client"

import React, {startTransition} from "react";
import {Button, Card, Flex, Spacing, Text, TextInput, useForm, useService, useStore} from "@code0-tech/pictor";
import CardSection from "@code0-tech/pictor/dist/components/card/CardSection";
import {TabContent} from "@code0-tech/pictor/dist/components/tab/Tab";
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
        },
        onSubmit: (values) => {
            startTransition(() => {

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
        </Card>
    </TabContent>

}