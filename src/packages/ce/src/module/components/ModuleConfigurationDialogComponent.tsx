"use client"

import React from "react";
import {useParams, useRouter} from "next/navigation";
import {
    Avatar,
    Button,
    Flex,
    hashToColor,
    Menu,
    MenuContent,
    MenuItem,
    MenuPortal,
    MenuTrigger,
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
    NamespaceProject,
    NamespaceProjectRuntimeAssignment,
    RuntimeModule
} from "@code0-tech/sagittarius-graphql-types";
import {getTypeSchema} from "@code0-tech/triangulum";
import {DatatypeService} from "@ce-internal/datatype/services/Datatype.service";
import {DataTypeInputComponent} from "@ce-internal/datatype/components/inputs/DataTypeInputComponent";
import {ButtonGroup} from "@code0-tech/pictor/dist/components/button-group/ButtonGroup";
import {Select} from "@radix-ui/react-select";
import {IconBadgeFilled, IconChevronDown} from "@tabler/icons-react";
import {RuntimeService} from "@ce-internal/runtime/services/Runtime.service";
import {ProjectService} from "@ce-internal/project/services/Project.service";
import {toast} from "@code0-tech/pictor/dist/components/toast/Toast";
import {InputDialog} from "@core/components/InputDialog";

export interface ModuleConfigurationDialogComponentProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export const ModuleConfigurationDialogComponent: React.FC<ModuleConfigurationDialogComponentProps> = ({
                                                                                                          open,
                                                                                                          onOpenChange
                                                                                                      }) => {

    const params = useParams()
    const moduleService = useService(ModuleService)
    const moduleStore = useStore(ModuleService)
    const dataTypeService = useService(DatatypeService)
    const runtimeService = useService(RuntimeService)
    const runtimeStore = useStore(RuntimeService)
    const projectService = useService(ProjectService)
    const projectStore = useStore(ProjectService)
    const router = useRouter()

    const namespaceIndex = params.namespaceId as any as number
    const projectIndex = params.projectId as any as number
    const moduleIndex = params.moduleId as any as number
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex}`
    const projectId: NamespaceProject['id'] = `gid://sagittarius/NamespaceProject/${projectIndex}`
    const moduleId: RuntimeModule['id'] = `gid://sagittarius/RuntimeModule/${moduleIndex}`

    const project = React.useMemo(
        () => projectService.getById(projectId),
        [projectStore, projectId]
    )

    const runtimes = React.useMemo(
        () => runtimeService.values().filter(runtime => project?.runtimes?.nodes?.some(r => r?.id === runtime.id)),
        [runtimeStore, project]
    )

    const runtime = React.useMemo(
        () => runtimes.find((runtime) => runtime.modules?.nodes?.find(module => module?.id === moduleId)),
        [runtimes]
    )

    const module = React.useMemo(
        () => moduleService.getById(moduleId, {
            namespaceId,
            projectId,
            runtimeId: runtime?.id
        }),
        [moduleId, moduleStore, namespaceId, projectId, runtime]
    )

    // Only runtimes that actually have this integration installed can be selected.
    const selectableRuntimes = React.useMemo(
        () => runtimes.filter(runtime => runtime.modules?.nodes?.some(m => m?.identifier === module?.identifier)),
        [runtimes, module?.identifier]
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
                const value = project?.runtimeAssignments?.nodes?.find(rA => rA?.runtime?.id == runtime?.id)?.moduleConfigurations?.nodes?.find?.(config => config?.definition?.id === moduleConfiguration?.id)?.value
                values[moduleConfiguration?.id!] = value ? {__typename: "LiteralValue", value: value} : null
            })
            return values
        },
        [module, project, runtime?.id]
    )

    const onSubmit = React.useCallback((values: Record<string, any>) => {
        const namespaceProjectRuntimeAssignmentId: NamespaceProjectRuntimeAssignment['id'] = project?.runtimeAssignments?.nodes?.find(rA => rA?.runtime?.id == runtime?.id)?.id
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
        }).then(payload => {
            if ((payload?.errors?.length ?? 0) <= 0) {
                toast({title: "Saved configuration", color: "success"})
            }
        })

    }, [projectService, project, runtime?.id])

    const [inputs, validate] = useForm({
        useInitialValidation: true,
        truthyValidationBeforeSubmit: false,
        initialValues: initialValues,
        onSubmit: onSubmit,
    })

    console.log(module)

    return <InputDialog open={open}
                        onOpenChange={(open) => onOpenChange?.(open)}
                        title={`${module?.names?.[0]?.content ?? "3-party"} Integration configuration`}
                        description={"Configure how this integration behaves within your project. Settings are applied per runtime and take effect for every flow that relies on it."}>
        <Flex justify={"space-between"} align={"center"}>
            <Text size={"lg"} hierarchy={"primary"} display={"block"}>
                {module?.names?.[0]?.content ?? "Integration"}
            </Text>
            <ButtonGroup>
                <Select key={runtime?.id}
                        value={runtime?.id as string}
                        onValueChange={(value) => {
                            const lRuntime = runtimes.find(r => r.id === value)
                            const lModule = lRuntime?.modules?.nodes?.find(m => m?.identifier === module?.identifier)
                            const number = lModule?.id?.match(/RuntimeModule\/(\d+)$/)?.[1]
                            router.push(`/namespace/${namespaceIndex}/project/${projectIndex}/module/${number}`)
                        }}>
                    <SelectTrigger asChild>
                        <Button variant={"none"} paddingSize={"xxs"}>
                            <SelectValue placeholder={"Select runtime"}/>
                            <IconChevronDown size={13}/>
                        </Button>
                    </SelectTrigger>
                    <SelectPortal>
                        <SelectContent side={"top"} sideOffset={8} position={"popper"}>
                            <SelectViewport>
                                {
                                    selectableRuntimes.map(runtime => {
                                        return <SelectItem value={runtime.id!}>
                                            <SelectItemText>
                                                <Flex align={"center"} style={{gap: "0.35rem"}}>
                                                    <Avatar size={13}
                                                            color={hashToColor(runtime.name!, 0, 180)}
                                                            identifier={runtime.name!}/>
                                                    <Text>
                                                        {runtime.name}
                                                    </Text>
                                                    {runtime.id === project?.primaryRuntime?.id &&
                                                        <IconBadgeFilled size={13}/>}
                                                </Flex>
                                            </SelectItemText>
                                        </SelectItem>
                                    })
                                }
                            </SelectViewport>
                        </SelectContent>
                    </SelectPortal>
                </Select>
                <Menu key={`${runtime?.id}-menu`}>
                    <MenuTrigger asChild>
                        <Button variant={"none"} paddingSize={"xxs"}>
                            Copy to runtime
                            <IconChevronDown size={13}/>
                        </Button>
                    </MenuTrigger>
                    <MenuPortal>
                        <MenuContent side={"top"} sideOffset={8}>
                            {
                                selectableRuntimes.map(pRuntime => {
                                    return <MenuItem onSelect={() => {
                                        const lRuntime = runtimes.find(r => r.id === pRuntime.id)
                                        const lModule = lRuntime?.modules?.nodes?.find(m => m?.identifier === module?.identifier)

                                        const lNamespaceProjectRuntimeAssignment1: NamespaceProjectRuntimeAssignment | undefined = project?.runtimeAssignments?.nodes?.find(rA => rA?.runtime?.id == runtime?.id)!
                                        const lNamespaceProjectRuntimeAssignment2: NamespaceProjectRuntimeAssignment | undefined = project?.runtimeAssignments?.nodes?.find(rA => rA?.runtime?.id == lRuntime?.id)!

                                        const lModuleConfigurations: Array<ModuleConfigurationInput> = lNamespaceProjectRuntimeAssignment2?.moduleConfigurations?.nodes?.map((config, index) => {
                                            return {
                                                moduleConfigurationDefinitionId: config?.definition?.id!,
                                                value: lNamespaceProjectRuntimeAssignment1?.moduleConfigurations?.nodes?.[index]?.value
                                            }
                                        }) ?? []


                                        projectService.projectModuleConfigurationUpdate({
                                            namespaceProjectRuntimeAssignmentId: lNamespaceProjectRuntimeAssignment2?.id!,
                                            moduleConfigurations: lModuleConfigurations
                                        }).then(payload => {
                                            if ((payload?.errors?.length ?? 0) <= 0) {
                                                toast({title: "Copied and saved configuration", color: "success"})
                                            }
                                        })

                                        const number = lModule?.id?.match(/RuntimeModule\/(\d+)$/)?.[1]
                                        router.push(`/namespace/${namespaceIndex}/project/${projectIndex}/module/${number}`)
                                    }}>
                                        <Flex align={"center"} style={{gap: "0.35rem"}}>
                                            <Avatar size={13}
                                                    color={hashToColor(pRuntime.name!, 0, 180)}
                                                    identifier={pRuntime.name!}/>
                                            <Text>
                                                {pRuntime.name}
                                            </Text>
                                            {pRuntime.id === project?.primaryRuntime?.id &&
                                                <IconBadgeFilled size={13}/>}
                                        </Flex>
                                    </MenuItem>
                                })
                            }
                        </MenuContent>
                    </MenuPortal>
                </Menu>
                <Button variant={"none"} color={"success"} onClick={validate} paddingSize={"xxs"}>
                    Save
                </Button>
            </ButtonGroup>
        </Flex>
        <Spacing key={"actions-spacing"} spacing={"xl"}/>
        <Text key={"about"} size={"md"} hierarchy={"tertiary"}>
            {module?.descriptions?.[0]?.content ?? "Configure how this integration behaves within your project. Settings are applied per runtime and take effect for every flow that relies on it."}
        </Text>
        <Spacing key={"about-spacing"} spacing={"xl"}/>
        <div key={"configurations"}>
            {
                module?.configurationDefinitions?.nodes?.map((moduleConfiguration, index) => {

                    if (!moduleConfiguration) return null
                    if (!moduleConfigurationSchemas[index]) return null

                    return <div key={moduleConfiguration.id}>
                        <DataTypeInputComponent description={moduleConfiguration.descriptions?.[0]?.content}
                                                title={moduleConfiguration.names?.[0]?.content}
                                                schema={moduleConfigurationSchemas[index]!}
                                                clearable
                                                {...inputs.getInputProps(moduleConfiguration.id!)}/>
                        <Spacing spacing={"xl"}/>
                    </div>
                })
            }
        </div>
    </InputDialog>
}
