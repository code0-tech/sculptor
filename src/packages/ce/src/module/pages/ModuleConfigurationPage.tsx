"use client"

import React from "react";
import {useParams} from "next/navigation";
import {
    Avatar,
    Badge,
    Button,
    Flex,
    hashToColor,
    SelectContent,
    SelectItem,
    SelectItemText,
    SelectPortal,
    SelectTrigger,
    SelectValue,
    SelectViewport,
    Spacing,
    Text,
    useForm,
    useService,
    useStore
} from "@code0-tech/pictor";
import {ModuleService} from "@ce/module/services/Module.service";
import {Namespace, NamespaceProject, RuntimeModule} from "@code0-tech/sagittarius-graphql-types";
import {getTypeSchema} from "@code0-tech/triangulum";
import {DatatypeService} from "@ce/datatype/services/Datatype.service";
import {DataTypeInputComponent} from "@ce/datatype/components/inputs/DataTypeInputComponent";
import {Panel} from "@xyflow/react";
import {ButtonGroup} from "@code0-tech/pictor/dist/components/button-group/ButtonGroup";
import '@xyflow/react/dist/style.css';
import {Select} from "@radix-ui/react-select";
import {IconChevronDown} from "@tabler/icons-react";
import {RuntimeService} from "@ce/runtime/services/Runtime.service";
import {ProjectService} from "@ce/project/services/Project.service";

export const ModuleConfigurationPage: React.FC = () => {

    const params = useParams()
    const moduleService = useService(ModuleService)
    const moduleStore = useStore(ModuleService)
    const dataTypeService = useService(DatatypeService)
    const runtimeService = useService(RuntimeService)
    const runtimeStore = useStore(RuntimeService)
    const projectService = useService(ProjectService)
    const projectStore = useStore(ProjectService)

    const namespaceIndex = params.namespaceId as any as number
    const projectIndex = params.projectId as any as number
    const moduleIndex = params.moduleId as any as number
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex}`
    const projectId: NamespaceProject['id'] = `gid://sagittarius/NamespaceProject/${projectIndex}`
    const moduleId: RuntimeModule['id'] = `gid://sagittarius/RuntimeModule/${moduleIndex}`

    const module = React.useMemo(
        () => moduleService.getById(moduleId, {
            namespaceId,
            projectId
        }),
        [moduleId, moduleStore, namespaceId, projectId]
    )

    const project = React.useMemo(
        () => projectService.getById(projectId),
        [projectStore, projectId]
    )

    const runtimes = React.useMemo(
        () => runtimeService.values().filter(runtime => project?.runtimes?.nodes?.some(r => r?.id === runtime.id)),
        [runtimeStore, project]
    )

    const moduleConfigurationSchemas = module?.configurationDefinitions?.nodes?.map(moduleConfiguration => {
        return getTypeSchema(moduleConfiguration?.type!, dataTypeService.values({
            namespaceId,
            projectId,
            runtimeId: `gid://sagittarius/Runtime/1`
        }))
    }) ?? []

    const initialValues = React.useMemo(
        () => {
            const values: Record<string, any> = {}
            module?.configurationDefinitions?.nodes?.forEach((moduleConfiguration, index) => {
                values[moduleConfiguration?.id!] = null
            })
            return values
        },
        [module]
    )

    const [inputs, validate] = useForm({
        initialValues: initialValues,
    })

    return <>
        <Text size={"xl"} hierarchy={"primary"}>
            {module?.names?.[0].content} plugin configuration
        </Text>
        <Spacing spacing={"xs"}/>
        <Text size={"md"} hierarchy={"tertiary"}>
            {module?.descriptions?.[0].content}<br/>
            This plugin was developed by {" "}
            <Badge color={"lightblue"}>
                @{module?.author}
            </Badge>
        </Text>
        <Spacing spacing={"xl"}/>
        {
            module?.configurationDefinitions?.nodes?.map((moduleConfiguration, index) => {

                return <>
                    <DataTypeInputComponent description={moduleConfiguration?.descriptions?.[0].content}
                                            title={moduleConfiguration?.names?.[0].content}
                                            schema={moduleConfigurationSchemas[index]!}
                                            clearable
                                            {...inputs.getInputProps(moduleConfiguration?.id!)}/>
                    <Spacing spacing={"xl"}/>
                </>
            })
        }
        <Panel position={"bottom-center"}>
            <ButtonGroup>
                <Select>
                    <SelectTrigger asChild>
                        <Button variant={"none"}>
                            <SelectValue placeholder={"Select runtime"}/>
                            <IconChevronDown size={13}/>
                        </Button>
                    </SelectTrigger>
                    <SelectPortal>
                        <SelectContent>
                            <SelectViewport>
                                {
                                    runtimes.map(runtime => {
                                        return <SelectItem value={runtime.id!}>
                                            <SelectItemText>
                                                <Flex align={"center"} style={{gap: "0.7rem"}}>
                                                    <Avatar size={16}
                                                            color={hashToColor(runtime.name!, 0, 180)}
                                                            identifier={runtime.name!}/>
                                                    <Text>
                                                        {runtime.name}
                                                    </Text>
                                                </Flex>
                                            </SelectItemText>
                                        </SelectItem>
                                    })
                                }
                            </SelectViewport>
                        </SelectContent>
                    </SelectPortal>
                </Select>
                <Button variant={"none"}>
                    Copy to runtime
                </Button>
                <Button variant={"none"} color={"success"}>
                    Save
                </Button>
            </ButtonGroup>
        </Panel>
    </>
}