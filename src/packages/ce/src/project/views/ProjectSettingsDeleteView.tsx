"use client"

import React, {startTransition} from "react";
import {Button, Spacing, Text, useService} from "@code0-tech/pictor";
import {TabContent} from "@code0-tech/pictor/dist/components/tab/Tab";
import {useParams, useRouter} from "next/navigation";
import {ProjectService} from "@edition/project/services/Project.service";
import {toast} from "@code0-tech/pictor/dist/components/toast/Toast";

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
                    toast({title: "Deleted project", color: "success"})
                }
                router.push(`/namespace/${namespaceId}`)
            })
        })
    }, [projectId])


    return <TabContent value={"delete"} style={{overflow: "hidden"}}>
        <Text size={"lg"} hierarchy={"primary"} display={"block"}>Delete project</Text>
        <Spacing spacing={"xs"}/>
        <Text size={"md"} hierarchy={"tertiary"}>
            Permanently delete this project and everything in it. This action cannot be undone.
        </Text>
        <Spacing spacing={"md"}/>
        <Button color={"error"} w={"100%"} onClick={deleteProject}>Delete project</Button>
    </TabContent>
}