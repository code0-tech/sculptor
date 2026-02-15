"use client"

import React, {startTransition} from "react";
import {Button, Card, Flex, Spacing, Text, toast, useService, useStore} from "@code0-tech/pictor";
import {TabContent} from "@code0-tech/pictor/dist/components/tab/Tab";
import {useParams, useRouter} from "next/navigation";
import {ProjectService} from "@edition/project/services/Project.service";

export const ProjectSettingsDeleteView: React.FC = () => {

    const params = useParams()
    const router = useRouter()
    const projectService = useService(ProjectService)

    const projectId = params.projectId as any as number
    const namespaceId = params.namespaceId as any as number

    const deleteProject = React.useCallback(() => {
        startTransition(() => {
            projectService.projectDelete({
                namespaceProjectId: `gid://sagittarius/NamespaceProject/${projectId}`
            }).then(payload => {
                if ((payload?.errors?.length ?? 0) <= 0) {
                    toast({
                        title: "The project was successfully deleted.",
                        color: "success",
                        dismissible: true,
                    })
                }
                router.push(`/namespace/${namespaceId}`)
            })
        })
    }, [projectId])


    return <TabContent value={"delete"}>
        <Flex justify={"space-between"} align={"end"}>
            <Text size={"xl"} hierarchy={"primary"}>Delete</Text>
        </Flex>
        <Spacing spacing={"xl"}/>
        <Card p={1.3} color={"error"}>
            <Flex justify={"space-between"} align={"center"}>
                <Flex style={{gap: ".35rem", flexDirection: "column"}}>
                    <Text size={"md"} hierarchy={"primary"}>
                        This will delete the project and cannot be undone.
                    </Text>
                </Flex>
                <Button color={"secondary"} variant={"filled"} onClick={deleteProject}>
                    Delete project
                </Button>
            </Flex>
        </Card>
    </TabContent>
}