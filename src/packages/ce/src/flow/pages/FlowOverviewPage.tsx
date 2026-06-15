import React from "react";
import {ResizablePanel} from "@code0-tech/pictor/dist/components/resizable/Resizable";
import {
    AuroraBackground,
    Button,
    Card,
    Col,
    EditorInput,
    Flex,
    Progress,
    ScrollArea,
    ScrollAreaScrollbar,
    ScrollAreaThumb,
    ScrollAreaViewport,
    SelectContent,
    SelectItem,
    SelectItemText,
    SelectPortal,
    SelectTrigger,
    SelectValue,
    SelectViewport,
    Spacing,
    Text
} from "@code0-tech/pictor";
import {Panel} from "@xyflow/react";
import {StreamLanguage} from "@codemirror/language";
import CardSection from "@code0-tech/pictor/dist/components/card/CardSection";
import {Select} from "@radix-ui/react-select";
import {IconChevronDown, IconSend} from "@tabler/icons-react";
import {SiClaude} from "@icons-pack/react-simple-icons";
import {icon, IconString} from "@core/util/icons";

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

    const [prompt, setPrompt] = React.useState<string>("")

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
            <Card paddingSize={"xs"} color={"secondary"}>
                <Card color={"primary"} paddingSize={"xxs"} mx={-0.6} mt={-0.6}>
                    <EditorInput
                        value={prompt}
                        onChange={(value) => setPrompt(value)}
                        wrapperComponent={{
                            style: {
                                background: "transparent",
                                boxShadow: "none"
                            }
                        }}
                        placeholder={"Ask AI anything..."}
                        language={StreamLanguage.define({
                            token(stream) {
                                stream.next()
                                return null;
                            }
                        })}/>
                    <Spacing spacing={"xxs"}/>
                    <CardSection>
                        <Flex justify={"space-between"} align={"center"}>
                            <Flex align={"center"} style={{gap: "0.35rem"}}>
                                <Select defaultValue={"claude-opus-4.7"}>
                                    <SelectTrigger w={"fit-content"} asChild>
                                        <Button paddingSize={"xxs"} variant={"none"}>
                                            <SelectValue placeholder={"Select modal"}/>
                                            <IconChevronDown size={13}/>
                                        </Button>
                                    </SelectTrigger>
                                    <SelectPortal>
                                        <SelectContent>
                                            <SelectViewport>
                                                <SelectItem value={"claude-opus-4.7"}>
                                                    <SelectItemText>
                                                        <Flex align={"center"} style={{gap: "0.35rem"}}>
                                                            <Text display={"flex"} align={"center"}
                                                                  style={{gap: "0.35rem"}}>
                                                                <SiClaude size={13} color={"default"}/>
                                                                Claude Opus 4.7
                                                            </Text>
                                                            <Text>
                                                                (4.0x)
                                                            </Text>
                                                        </Flex>
                                                    </SelectItemText>
                                                </SelectItem>
                                            </SelectViewport>
                                        </SelectContent>
                                    </SelectPortal>
                                </Select>
                                <Select>
                                    <SelectTrigger w={"fit-content"} asChild>
                                        <Button paddingSize={"xxs"} variant={"none"}>
                                            <SelectValue placeholder={"Let AI decide the flow type"}/>
                                            <IconChevronDown size={13}/>
                                        </Button>
                                    </SelectTrigger>
                                    <SelectPortal>
                                        <SelectContent>
                                            <SelectViewport>
                                                <SelectItem value={"webhook"}>
                                                    <SelectItemText>
                                                        <Text>Webhook</Text>
                                                    </SelectItemText>
                                                </SelectItem>
                                                <SelectItem value={"cron"}>
                                                    <SelectItemText>
                                                        <Text>Cron Job</Text>
                                                    </SelectItemText>
                                                </SelectItem>
                                            </SelectViewport>
                                        </SelectContent>
                                    </SelectPortal>
                                </Select>
                            </Flex>
                            <Flex align={"center"} style={{gap: "0.35rem"}}>
                                <Button variant={"none"} color={"tertiary"}>
                                    <IconSend size={13}/>
                                </Button>
                            </Flex>
                        </Flex>
                    </CardSection>
                </Card>
                <Spacing spacing={"xs"}/>
                <Flex align={"center"} justify={"space-between"} p={0.35} style={{gap: "0.35rem"}}>
                    <Text>
                        Upgrade your license to increase your AI usage limit
                    </Text>
                    <Progress w={"100px"} h={"7.5px"} value={86} max={100}
                              color={"#70ffb2"}/>
                </Flex>
            </Card>
        </Panel>
    </ResizablePanel>
}