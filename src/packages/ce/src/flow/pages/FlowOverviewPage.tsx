import React from "react";
import {useParams} from "next/navigation";
import {ResizablePanel} from "@code0-tech/pictor/dist/components/resizable/Resizable";
import {
    AuroraBackground,
    Button,
    Card,
    Col,
    EditorInput,
    Flex,
    Progress,
    Row,
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
import {SiClaude, SiDhl, SiDiscord, SiGithub, SiShopify} from "@icons-pack/react-simple-icons";

export const FlowOverviewPage: React.FC = () => {
    const params = useParams();

    const namespaceIndex = params?.namespaceId as any as number

    return <ResizablePanel id={"2"} color={"primary"}
                           style={{borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem"}}>
        <AuroraBackground/>
        <Flex align={"center"} justify={"center"} style={{flexDirection: "column", gap: "1.3rem"}} w={"100%"}
              h={"100%"}>
            <Text hierarchy={"primary"} style={{fontWeight: "bold", textAlign: "center", fontSize: "2rem"}}>
                Good morning, @root <br/>
                Let's automate something.
            </Text>
            <Row w={"50%"}>
                <Col xs={6}>
                    <Card paddingSize={"xs"} color={"secondary"}>
                        <Flex align={"center"} justify={"space-between"} style={{gap: "0.35rem"}}>
                            <Flex align={"center"} style={{gap: "0.35rem"}}>
                                <SiShopify size={13} color={"default"}/>
                                <Text>
                                    /
                                </Text>
                                <SiDhl size={13} color={"default"}/>
                            </Flex>
                            <Text>
                                Smart logistics
                            </Text>
                        </Flex>
                        <Spacing spacing={"xs"}/>
                        <Card color={"primary"} mx={-0.6} mb={-0.6}>
                            <Text>
                                Create a parcel shipment over DHL API on order receivement from shopify.
                            </Text>
                        </Card>
                    </Card>
                </Col>
                <Col xs={6}>
                    <Card paddingSize={"xs"} color={"secondary"}>
                        <Flex align={"center"} justify={"space-between"} style={{gap: "0.35rem"}}>
                            <Flex align={"center"} style={{gap: "0.35rem"}}>
                                <SiDiscord size={13} color={"default"}/>
                                <Text>
                                    /
                                </Text>
                                <SiGithub size={13} color={"white"}/>
                            </Flex>
                            <Text>
                                Smart devops
                            </Text>
                        </Flex>
                        <Spacing spacing={"xs"}/>
                        <Card color={"primary"} mx={-0.6} mb={-0.6}>
                            <Text>
                                Create a discord message if a new issue is created in github.
                            </Text>
                        </Card>
                    </Card>
                </Col>
            </Row>
        </Flex>
        <Panel position={"bottom-center"} style={{width: "60%"}}>
            <Card paddingSize={"xs"} color={"secondary"}>
                <Card color={"primary"} paddingSize={"xxs"} mx={-0.6} mt={-0.6}>
                    <EditorInput
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
                                <Select defaultValue={"ask"}>
                                    <SelectTrigger w={"fit-content"} asChild>
                                        <Button paddingSize={"xxs"} variant={"none"}>
                                            <SelectValue placeholder={"Select mode"}/>
                                            <IconChevronDown size={13}/>
                                        </Button>
                                    </SelectTrigger>
                                    <SelectPortal>
                                        <SelectContent>
                                            <SelectViewport>
                                                <SelectItem value={"ask"}>
                                                    <SelectItemText>
                                                        <Text>Ask</Text>
                                                    </SelectItemText>
                                                </SelectItem>
                                                <SelectItem value={"agent"}>
                                                    <SelectItemText>
                                                        <Text>Agent</Text>
                                                    </SelectItemText>
                                                </SelectItem>
                                            </SelectViewport>
                                        </SelectContent>
                                    </SelectPortal>
                                </Select>
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