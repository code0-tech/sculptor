"use client"

import React from "react";
import {useParams, useRouter} from "next/navigation";
import {Namespace, NamespaceProject} from "@code0-tech/sagittarius-graphql-types";
import {
    Badge,
    Button,
    Card,
    Col,
    Flex,
    hashToColor,
    Row,
    ScrollArea, ScrollAreaScrollbar, ScrollAreaThumb,
    ScrollAreaViewport,
    Spacing,
    Text,
    useService,
    useStore
} from "@code0-tech/pictor";
import {ModuleService} from "@ce-internal/module/services/Module.service";
import {icon, IconString} from "@core/util/icons";
import {IconCheck} from "@tabler/icons-react";
import CardSection from "@code0-tech/pictor/dist/components/card/CardSection";
import {ProjectService} from "@ce-internal/project/services/Project.service";
import Link from "next/link";

export const ModulesPage: React.FC = () => {

    const router = useRouter()
    const params = useParams()
    const moduleService = useService(ModuleService)
    const moduleStore = useStore(ModuleService)
    const projectService = useService(ProjectService)
    const projectStore = useStore(ProjectService)

    const namespaceIndex = params.namespaceId as any as number
    const projectIndex = params.projectId as any as number
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex}`
    const projectId: NamespaceProject['id'] = `gid://sagittarius/NamespaceProject/${projectIndex}`

    const project = React.useMemo(
        () => projectService.getById(projectId, {namespaceId}),
        [projectId, projectStore]
    )

    const modules = React.useMemo(
        () => moduleService.values({
            namespaceId,
            projectId,
            runtimeId: project?.primaryRuntime?.id
        }),
        [params, namespaceId, projectId, moduleStore, project]
    )

    return <>
        <div style={{
            background: "#070514",
            height: "100%",
            padding: "2rem",
            borderTopLeftRadius: "1rem",
            borderTopRightRadius: "1rem"
        }}>
            <ScrollArea h={"100%"}>
                <ScrollAreaViewport>
                    <Flex justify={"space-between"} pt={"0"} py={1} style={{flexWrap: "wrap"}} align={"start"}>
                        <Text size={"xl"} hierarchy={"primary"}>
                            Installed plugins on {project?.name}
                        </Text>
                        <Button color={"tertiary"}>
                            Learn how to install plugins
                        </Button>
                    </Flex>
                    <Spacing spacing={"xl"}/>
                    <Row key={modules.length}>
                        {
                            modules.map(module => {

                                const DisplayIcon = icon(module.icon as IconString)

                                return <Col xs={6} md={4} lg={3} xxl={3} mb={1}>
                                    <Card color={"secondary"} paddingSize={"sm"}>
                                        <CardSection border>
                                            <Flex style={{flexDirection: "column", gap: "1rem", flexWrap: "wrap"}}>
                                                <Flex justify={"space-between"} style={{flexWrap: "wrap"}}
                                                      align={"center"}>
                                                    <Flex style={{gap: "0.7rem", flexWrap: "wrap"}} align={"center"}>
                                                        <Card color={"tertiary"} w={"2.5rem"} p={"0"} h={"2.5rem"}
                                                              display={"flex"}
                                                              align={"center"} justify={"center"}>
                                                            <DisplayIcon
                                                                size={16}
                                                                color={hashToColor(module.id!)}
                                                            />
                                                        </Card>
                                                        <Flex style={{
                                                            flexDirection: "column",
                                                            gap: "0.175rem",
                                                            flexWrap: "wrap"
                                                        }}>
                                                            <Text size={"md"} hierarchy={"primary"}>
                                                                {module.names?.[0].content}
                                                            </Text>
                                                            <Text size={"xs"} hierarchy={"tertiary"}>
                                                                {module.flowTypes?.count ? `${module.flowTypes.count} flow types` : null}
                                                                {module.flowTypes?.count && module.functionDefinitions?.count ? " and " : null}
                                                                {module.functionDefinitions?.count ? `${module.functionDefinitions.count} functions` : null}
                                                            </Text>
                                                        </Flex>
                                                    </Flex>
                                                    <Badge color={"success"}>
                                                        <IconCheck style={{
                                                            minWidth: "13px",
                                                            minHeight: "13px",
                                                        }} size={13}/>
                                                        installed
                                                    </Badge>
                                                </Flex>
                                                <Text hierarchy={"tertiary"}>
                                                    {module.descriptions?.[0]?.content} <br/>
                                                    This plugin was developed by
                                                    <Badge color={"lightblue"}>
                                                        @{module.author}
                                                    </Badge>
                                                </Text>
                                            </Flex>
                                        </CardSection>
                                        <CardSection border>
                                            <Flex align={"center"} style={{gap: "0.35rem"}}>
                                                <Button variant={"none"} w={"100%"}>
                                                    Documentation
                                                </Button>
                                                <Button onClick={() => {
                                                    const number = module?.id?.match(/RuntimeModule\/(\d+)$/)?.[1]
                                                    router.push(`/namespace/${namespaceIndex}/project/${projectIndex}/module/${number}`)
                                                }} disabled={(module.configurationDefinitions?.nodes?.length ?? 0) <= 0}
                                                        color={"tertiary"} w={"100%"}>
                                                    Configure
                                                </Button>
                                            </Flex>
                                        </CardSection>
                                    </Card>
                                </Col>
                            })
                        }
                        <Col xs={6} md={4} lg={3} xxl={3} mb={1}>
                            <Card h={"100%"}
                                  style={{
                                      textAlign: "center",
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "center"
                                  }}>
                                <Text size={"md"} hierarchy={"primary"}>Are you missing a plugin?</Text>
                                <Spacing spacing={"xxs"}/>
                                <Text>
                                    Create a issue on our github repository or join our discord to request a plugin
                                </Text>
                                <Spacing spacing={"sm"}/>
                                <Link href={"https://github.com/code0-tech/codezero"}>
                                    <Button>Request a plugin</Button>
                                </Link>
                            </Card>
                        </Col>
                    </Row>
                    <ScrollAreaScrollbar orientation={"vertical"}>
                        <ScrollAreaThumb/>
                    </ScrollAreaScrollbar>
                </ScrollAreaViewport>
            </ScrollArea>
        </div>
    </>

}