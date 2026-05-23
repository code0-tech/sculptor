"use client"

import React from "react";
import {useParams} from "next/navigation";
import {useService, useStore} from "@code0-tech/pictor";
import {ModuleService} from "@ce/module/services/Module.service";
import {Namespace, NamespaceProject} from "@code0-tech/sagittarius-graphql-types";

export const ModuleConfigurationPage: React.FC = () => {

    const params = useParams()
    const moduleService = useService(ModuleService)
    const moduleStore = useStore(ModuleService)

    const namespaceIndex = params.namespaceId as any as number
    const projectIndex = params.projectId as any as number
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex}`
    const projectId: NamespaceProject['id'] = `gid://sagittarius/NamespaceProject/${projectIndex}`

    return <div style={{
        background: "#070514",
        height: "100%",
        padding: "1rem",
        borderTopLeftRadius: "1rem",
        borderTopRightRadius: "1rem"
    }}>
    </div>
}