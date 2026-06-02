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
import {ModuleService} from "@ce-internal/module/services/Module.service";
import {
    ModuleConfigurationInput,
    Namespace,
    NamespaceProject, NamespaceProjectRuntimeAssignment,
    Runtime,
    RuntimeModule, Scalars
} from "@code0-tech/sagittarius-graphql-types";
import {getTypeSchema} from "@code0-tech/triangulum";
import {DatatypeService} from "@ce-internal/datatype/services/Datatype.service";
import {DataTypeInputComponent} from "@ce-internal/datatype/components/inputs/DataTypeInputComponent";
import {Panel} from "@xyflow/react";
import {ButtonGroup} from "@code0-tech/pictor/dist/components/button-group/ButtonGroup";
import '@xyflow/react/dist/style.css';
import {Select} from "@radix-ui/react-select";
import {IconChevronDown} from "@tabler/icons-react";
import {RuntimeService} from "@ce-internal/runtime/services/Runtime.service";
import {ProjectService} from "@ce-internal/project/services/Project.service";

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

    const [selectedRuntime, setSelectedRuntime] = React.useState<Runtime['id'] | undefined>(project?.primaryRuntime?.id)

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
                const value = project?.runtimeAssignments?.nodes?.find(rA => rA?.runtime?.id == selectedRuntime)?.moduleConfigurations?.nodes?.find?.(config => config?.id === moduleConfiguration?.id)?.value
                values[moduleConfiguration?.id!] = {__typename: "LiteralValue", value: value ?? null}
            })
            return values
        },
        [module, selectedRuntime]
    )

    const onSubmit = React.useCallback((values: Record<string, any>) => {
        const namespaceProjectRuntimeAssignmentId: NamespaceProjectRuntimeAssignment['id'] = project?.runtimeAssignments?.nodes?.find(rA => rA?.runtime?.id == selectedRuntime)?.id
        const moduleConfigurations: Array<ModuleConfigurationInput> = Object.entries(values)?.map(([key, value]) => {
            return {
                moduleConfigurationDefinitionId: key,
                value: value?.value ?? null
            } as ModuleConfigurationInput
        })

        if (!namespaceProjectRuntimeAssignmentId) return

        projectService.projectModuleConfigurationUpdate({
            namespaceProjectRuntimeAssignmentId,
            moduleConfigurations
        })
    }, [selectedRuntime, projectService, project])

    const [inputs, validate] = useForm({
        initialValues,
        onSubmit,
    })

    React.useEffect(() => {
        setSelectedRuntime(project?.primaryRuntime?.id)
    }, [project?.primaryRuntime?.id])

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
                <Select key={selectedRuntime}
                        value={selectedRuntime as string}
                        onValueChange={(value) => setSelectedRuntime(value as Runtime['id'])}>
                    <SelectTrigger asChild>
                        <Button variant={"none"} paddingSize={"xxs"}>
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
                <Button variant={"none"} paddingSize={"xxs"}>
                    Copy to runtime
                </Button>
                <Button variant={"none"} color={"success"} onClick={validate} paddingSize={"xxs"}>
                    Save
                </Button>
            </ButtonGroup>
        </Panel>
    </>
}