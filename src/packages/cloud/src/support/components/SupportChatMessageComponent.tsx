"use client"

import React from "react";
import {Avatar, Card, Flex, getSize, Icon, Spacing, Text} from "@code0-tech/pictor";
import {
    IconAlertTriangle,
    IconClock,
    IconDownload,
    IconFile,
    IconFileTypePdf,
    IconPhoto
} from "@tabler/icons-react";
import {SupportMessage} from "@cloud-internal/support/services/Support.chat.types";

export interface SupportChatMessageComponentProps {
    message: SupportMessage
    continued: boolean
}

export const SupportChatMessageComponent: React.FC<SupportChatMessageComponentProps> = (props) => {

    const {message, continued} = props

    const own = message.author?.type === "contact"
    const name = [message.author?.first_name, message.author?.last_name].filter(Boolean).join(" ")
    const agent = message.author?.type === "agent" && !!name
    const body = message.text_content || message.content

    return <Flex align={"flex-end"} style={{gap: getSize("xs"), flexDirection: own ? "row-reverse" : "row"}}>
        {own ? null : <div style={{width: "24px", minWidth: "24px"}}>
            {continued ? null : agent
                ? <Avatar identifier={message.author.avatar_url ? undefined : name}
                          src={message.author.avatar_url ?? undefined} type={"character"} size={24}
                          style={{borderRadius: "100%"}}/>
                : <Icon icon={"codezero:codezero"} color={"#fff"} size={24}/>}
        </div>}
        <div style={{maxWidth: "78%", textAlign: own ? "right" : "left"}}>
            {own || continued ? null : <>
                <Text size={"xs"} hierarchy={"tertiary"}>{agent ? name : "CodeZero"}</Text>
                <Spacing spacing={"xxxs"}/>
            </>}
            <Card color={own ? "info" : "secondary"} paddingSize={"xs"} display={"inline-block"}
                  style={{
                      textAlign: "left",
                      borderRadius: getSize("md"),
                      borderTopRightRadius: own ? getSize("xxs") : undefined,
                      borderTopLeftRadius: own ? undefined : getSize("xxs"),
                      opacity: message.status === "failed" ? 0.5 : 1,
                  }}>
                {body ? <Text style={{whiteSpace: "pre-wrap", wordBreak: "break-word"}}>
                    {body}
                </Text> : null}
                {(message.attachments ?? []).map((attachment, index) => {

                    const attachmentName = attachment.name || attachment.filename || "Attachment"
                    const fileName = attachmentName.length > 10
                        ? `${attachmentName.slice(0, 10)}…`
                        : attachmentName
                    const fileSize = attachment.size ? `${Math.max(1, Math.round(attachment.size / 1024))} KB` : undefined
                    const image = !!attachment.content_type?.startsWith("image/")
                    const pdf = attachment.content_type === "application/pdf"

                    return <React.Fragment key={attachment.uuid ?? index}>
                        {body || index ? <Spacing spacing={"xxs"}/> : null}
                        {image && attachment.url
                            ? <a href={attachment.url} target={"_blank"} rel={"noreferrer"}>
                                <img src={attachment.url} alt={attachmentName} style={{
                                    display: "block",
                                    maxWidth: "100%",
                                    maxHeight: "14rem",
                                    borderRadius: getSize("xs")
                                }}/>
                            </a>
                            : <a href={attachment.url} target={"_blank"} rel={"noreferrer"}
                                 style={{
                                     textDecoration: "none",
                                     pointerEvents: attachment.url ? "auto" : "none"
                                 }}>
                                <Card color={"primary"} paddingSize={"xxs"} clickable={!!attachment.url}>
                                    <Flex align={"center"} justify={"space-between"} style={{gap: getSize("sm")}}>
                                        <Flex align={"center"} style={{gap: getSize("xs"), minWidth: 0}}>
                                            {image ? <IconPhoto size={16} style={{minWidth: "16px"}}/> : null}
                                            {pdf ? <IconFileTypePdf size={16} style={{minWidth: "16px"}}/> : null}
                                            {image || pdf ? null : <IconFile size={16} style={{minWidth: "16px"}}/>}
                                            <div style={{minWidth: 0}}>
                                                <Text size={"sm"} style={{
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap"
                                                }}>
                                                    {fileName}
                                                </Text>
                                                {fileSize
                                                    ? <Text size={"xs"} hierarchy={"tertiary"}>{fileSize}</Text>
                                                    : null}
                                            </div>
                                        </Flex>
                                        {attachment.url ? <IconDownload size={14} style={{minWidth: "14px"}}/> : null}
                                    </Flex>
                                </Card>
                            </a>}
                    </React.Fragment>
                })}
            </Card>
            {message.status === "sending" || message.status === "failed" ? <>
                <Spacing spacing={"xxxs"}/>
                <Flex align={"center"} justify={own ? "flex-end" : "flex-start"} style={{gap: getSize("xxxs")}}>
                    {message.status === "sending" ? <IconClock size={11}/> : <IconAlertTriangle size={11}/>}
                    <Text size={"xs"} hierarchy={"tertiary"}>
                        {message.status === "sending" ? "Sending" : "Not delivered"}
                    </Text>
                </Flex>
            </> : null}
        </div>
    </Flex>
}
