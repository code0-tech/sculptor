"use client"

import React from "react";
import {useParams} from "next/navigation";
import {Namespace, NamespaceProject, Runtime} from "@code0-tech/sagittarius-graphql-types";
import {
    Badge,
    Button,
    Card,
    Col,
    Flex,
    hashToColor,
    Row,
    Spacing,
    Text,
    useService,
    useStore
} from "@code0-tech/pictor";
import {ModuleService} from "@ce/module/services/Module.service";
import {icon, IconString} from "@core/util/icons";
import {IconCheck} from "@tabler/icons-react";
import CardSection from "@code0-tech/pictor/dist/components/card/CardSection";

export const ModulesPage: React.FC = () => {

    const params = useParams()
    const moduleService = useService(ModuleService)
    const moduleStore = useStore(ModuleService)

    const namespaceIndex = params.namespaceId as any as number
    const projectIndex = params.projectId as any as number
    const runtimeIndex = params.runtimeId as any as number
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex}`
    const projectId: NamespaceProject['id'] = `gid://sagittarius/NamespaceProject/${projectIndex}`
    const runtimeId: Runtime['id'] = `gid://sagittarius/Runtime/${runtimeIndex}`

    const modules = React.useMemo(
        () => moduleService.values({
            namespaceId,
            projectId
        }),
        [params, namespaceId, projectId, moduleStore]
    )

    return <div style={{
        background: "#070514",
        height: "100%",
        padding: "1rem",
        borderTopLeftRadius: "1rem",
        borderTopRightRadius: "1rem"
    }}>
        <Flex style={{gap: "0.35rem", flexDirection: "column"}}>
            <Text size={"xl"} hierarchy={"primary"}>
                Installed plugins for the project
            </Text>
            <Text size={"sm"} hierarchy={"tertiary"}>
                Extend the capabilities of your runtime by installing plugins. Plugins can provide new flow types and
                function.
            </Text>
        </Flex>
        <Spacing spacing={"xl"}/>
        <Row key={modules.length}>
            {
                modules.map(module => {

                    const DisplayIcon = icon(module.icon as IconString)

                    return <Col xs={3} mb={1}>
                        <Card color={"secondary"} paddingSize={"sm"}>
                            <CardSection border>
                                <Flex style={{flexDirection: "column", gap: "1rem", flexWrap: "wrap"}}>
                                    <Flex justify={"space-between"} style={{flexWrap: "wrap"}} align={"center"}>
                                        <Flex style={{gap: "0.7rem", flexWrap: "wrap"}} align={"center"}>
                                            <Card color={"tertiary"} w={"2.5rem"} p={"0"} h={"2.5rem"} display={"flex"}
                                                  align={"center"} justify={"center"}>
                                                <DisplayIcon
                                                    size={16}
                                                    color={hashToColor(module.id!)}
                                                />
                                            </Card>
                                            <Flex style={{flexDirection: "column", gap: "0.175rem", flexWrap: "wrap"}}>
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
                                        {module.descriptions?.[0].content} <br/>
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
                                    <Button color={"tertiary"} w={"100%"}>
                                        Configure
                                    </Button>
                                </Flex>
                            </CardSection>
                        </Card>
                    </Col>
                })
            }
        </Row>
    </div>

}