import React from "react";
import {ResizablePanel} from "@code0-tech/pictor/dist/components/resizable/Resizable";
import {
    AuroraBackground,
    Card,
    Col,
    Flex,
    ScrollArea,
    ScrollAreaScrollbar,
    ScrollAreaThumb,
    ScrollAreaViewport,
    Spacing,
    Text,
    useService,
    useStore
} from "@code0-tech/pictor";
import {Panel} from "@xyflow/react";
import {icon, IconString} from "@core/util/icons";
import {AIChatComponent} from "@edition/ai/components/AIChatComponent";
import {useParams} from "next/navigation";
import {
    AiGenerateFlowSubscriptionPayload,
    Namespace,
    NamespaceProject
} from "@code0-tech/sagittarius-graphql-types";
import {FlowService} from "@edition/flow/services/Flow.service";
import {mapAiGenerationFlowToFlowInput} from "@edition/ai/util/AI.flow.mapper";
import {addIslandSuccessNotification} from "@code0-tech/pictor/dist/components/island/Island.hook";

const flowTemplates = [
    {
        icons: [
            "simple:shopify",
            "simple:dhl",
        ],
        description: "Smart logistics",
        prompt: "Create a parcel shipment over DHL API on order receivement from shopify."
    },
    {
        icons: [
            "simple:discord",
            "simple:github",
        ],
        description: "Smart devops",
        prompt: "Create a discord message if a new issue is created in github."
    },
]

export const FlowOverviewPage: React.FC = () => {

    const params = useParams()
    const [prompt, setPrompt] = React.useState<string>("")

    const namespaceIndex = params.namespaceId as any as number
    const projectIndex = params.projectId as any as number
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex}`
    const projectId: NamespaceProject['id'] = `gid://sagittarius/NamespaceProject/${projectIndex}`

    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)

    const onAIData = React.useCallback((payload: AiGenerateFlowSubscriptionPayload) => {
        const aiFlow = payload?.flow
        if (!aiFlow) return

        const existingNames = (flowService.values({namespaceId, projectId}) ?? [])
            .map(f => f.name)
            .filter((n): n is string => !!n)

        const flowInput = mapAiGenerationFlowToFlowInput(aiFlow, {existingNames})
        if (!flowInput) return

        flowService.flowCreate({
            flow: flowInput,
            projectId: projectId,
        }).then(result => {
            if ((result?.errors?.length ?? 0) <= 0) {
                addIslandSuccessNotification({message: "Created flow"})
            }
        })
    }, [flowService, flowStore, namespaceId, projectId])

    return <ResizablePanel id={"2"} color={"primary"}
                           style={{borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem"}}>
        <AuroraBackground/>
        <Flex align={"center"} justify={"center"} style={{flexDirection: "column", gap: "1.3rem"}} w={"100%"}
              h={"100%"}>
            <Text hierarchy={"primary"} style={{fontWeight: "bold", textAlign: "center", fontSize: "2rem"}}>
                Good morning, @root <br/>
                Let's automate something.
            </Text>
            {/*@ts-ignore*/}
            <ScrollArea type={"none"} w={"100%"}>
                <ScrollAreaViewport>
                    <Flex style={{gap: "0.7rem"}}>
                        <style>
                            {`
                                .hover-card:hover {
                                    cursor: pointer;
                                    box-shadow: inset 0 1px 1px #70ffb2;
                                }
                            `}
                        </style>
                        <Col xs={3} children={undefined}/>
                        {flowTemplates.map(flowTemplate => {

                            const displayIcons = flowTemplate.icons.map(i => icon(i as IconString))

                            return <Col xs={3} onClick={() => setPrompt(flowTemplate.prompt)}>
                                <Card className={"hover-card"} paddingSize={"xs"} color={"secondary"}>
                                    <Flex align={"center"} justify={"space-between"} style={{gap: "0.35rem"}}>
                                        <Flex align={"center"} style={{gap: "0.35rem"}}>
                                            {displayIcons.map((DisplayIcon) => (
                                                /* @ts-ignore*/
                                                <DisplayIcon color={"white"} size={13}/>
                                            ))}
                                        </Flex>
                                        <Text>
                                            {flowTemplate.description}
                                        </Text>
                                    </Flex>
                                    <Spacing spacing={"xs"}/>
                                    <Card color={"primary"} mx={-0.6} mb={-0.6}>
                                        <Text>
                                            {flowTemplate.prompt}
                                        </Text>
                                    </Card>
                                </Card>
                            </Col>
                        })}
                        <Col xs={3} children={undefined}/>
                    </Flex>
                </ScrollAreaViewport>
                <ScrollAreaScrollbar orientation={"horizontal"}>
                    <ScrollAreaThumb/>
                </ScrollAreaScrollbar>
            </ScrollArea>

        </Flex>
        <Panel position={"bottom-center"} style={{width: "60%"}}>
            <AIChatComponent projectId={projectId} prompt={prompt} onData={onAIData}/>
        </Panel>
    </ResizablePanel>
}