import React from "react";
import {Button, Card, Flex, getSize, Spacing, Text} from "@code0-tech/pictor";
import {IconAlertTriangle, IconBraces, IconCheck, IconTool} from "@tabler/icons-react";
import {ChatEntry, ChatToolCall} from "@edition/flow/utils/FlowExecuteOpenAi.chat.util";

export interface FlowExecuteOpenAiDetailsComponentProps {
    entry: ChatEntry
    waiting: boolean
    rawOpen: boolean
    onAnswer: (toolCall: ChatToolCall) => void
}

export const FlowExecuteOpenAiDetailsComponent: React.FC<FlowExecuteOpenAiDetailsComponentProps> = (props) => {

    const {entry, waiting, rawOpen, onAnswer} = props

    return <>
        {(entry.message.tool_calls ?? []).map(toolCall => <React.Fragment key={toolCall.id}>
            <Spacing spacing={"xxs"}/>
            <Card color={"primary"} paddingSize={"xxs"} style={{textAlign: "left"}}>
                <Flex align={"center"} justify={"space-between"} style={{gap: getSize("xs")}}>
                    <Flex align={"center"} style={{gap: getSize("xxs")}}>
                        <IconTool size={13} style={{minWidth: "13px"}}/>
                        <Text size={"sm"}>{toolCall.function.name}</Text>
                    </Flex>
                    <Button variant={"none"} color={"secondary"} style={{padding: getSize("xs")}}
                            disabled={waiting}
                            onClick={() => onAnswer(toolCall)}>
                        <Text size={"xs"}>Answer</Text>
                    </Button>
                </Flex>
                {toolCall.function.arguments ? <>
                    <Spacing spacing={"xxxs"}/>
                    <Text size={"xs"} hierarchy={"tertiary"}
                          style={{whiteSpace: "pre-wrap", wordBreak: "break-all"}}>
                        {toolCall.function.arguments}
                    </Text>
                </> : null}
            </Card>
        </React.Fragment>)}

        {entry.structured ? <>
            <Spacing spacing={"xxs"}/>
            <Card color={"primary"} paddingSize={"xxs"} style={{textAlign: "left"}}>
                <Flex align={"center"} style={{gap: getSize("xxs")}}>
                    <IconBraces size={13} style={{minWidth: "13px"}}/>
                    <Text size={"xs"} hierarchy={"tertiary"}>Structured response</Text>
                </Flex>
                <Spacing spacing={"xxxs"}/>
                <Text size={"xs"} style={{whiteSpace: "pre-wrap", wordBreak: "break-all"}}>
                    {JSON.stringify(entry.structured, null, 2)}
                </Text>
            </Card>
        </> : null}

        {(entry.steps ?? []).map((step, stepIndex) => <React.Fragment key={`${entry.id}-step-${stepIndex}`}>
            <Spacing spacing={"xxs"}/>
            <Card color={"primary"} paddingSize={"xxs"} style={{textAlign: "left"}}>
                <Flex align={"center"} style={{gap: getSize("xxs")}}>
                    {step.error
                        ? <IconAlertTriangle size={13} style={{minWidth: "13px"}}/>
                        : <IconCheck size={13} style={{minWidth: "13px"}}/>}
                    <Text size={"sm"}>{step.name}</Text>
                </Flex>
                {step.args ? <>
                    <Spacing spacing={"xxxs"}/>
                    <Text size={"xs"} hierarchy={"tertiary"}
                          style={{whiteSpace: "pre-wrap", wordBreak: "break-all"}}>
                        {JSON.stringify(step.args)}
                    </Text>
                </> : null}
                {step.result || step.error ? <>
                    <Spacing spacing={"xxxs"}/>
                    <Text size={"xs"} style={{whiteSpace: "pre-wrap", wordBreak: "break-word"}}>
                        {step.error ?? step.result}
                    </Text>
                </> : null}
            </Card>
        </React.Fragment>)}

        {(entry.approvals ?? []).map((approval, approvalIndex) => <React.Fragment
            key={`${entry.id}-approval-${approvalIndex}`}>
            <Spacing spacing={"xxs"}/>
            <Card color={"warning"} paddingSize={"xxs"} style={{textAlign: "left"}}>
                <Text size={"xs"} hierarchy={"tertiary"}>Awaiting approval</Text>
                <Spacing spacing={"xxxs"}/>
                <Text size={"sm"}>{approval.name}</Text>
                {approval.args || approval.code ? <>
                    <Spacing spacing={"xxxs"}/>
                    <Text size={"xs"} hierarchy={"tertiary"}
                          style={{whiteSpace: "pre-wrap", wordBreak: "break-all"}}>
                        {approval.code ?? JSON.stringify(approval.args)}
                    </Text>
                </> : null}
            </Card>
        </React.Fragment>)}

        {rawOpen && entry.raw ? <>
            <Spacing spacing={"xxs"}/>
            <Card color={"primary"} paddingSize={"xxs"} style={{textAlign: "left"}}>
                <Text size={"xs"} style={{whiteSpace: "pre-wrap", wordBreak: "break-all"}}>
                    {JSON.stringify(entry.raw, null, 2)}
                </Text>
            </Card>
        </> : null}
    </>
}
